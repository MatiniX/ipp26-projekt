#!/usr/bin/env python3
"""
An integration testing script for the SOL26 interpreter.

IPP: You can implement the entire tool in this file if you wish, but it is recommended to split
     the code into multiple files and modules as you see fit.

     Below, you have some code to get you started with the CLI argument parsing and logging setup,
     but you are **free to modify it** in whatever way you like.

Author: Ondřej Ondryáš <iondryas@fit.vut.cz>
"""
import argparse
import logging
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from models import (
    CategoryReport,
    TestCaseDefinition,
    TestCaseReport,
    TestCaseType,
    TestReport,
    TestResult,
    UnexecutedReason,
    UnexecutedReasonCode,
)

logger = logging.getLogger("main")
class CliArguments(argparse.Namespace):
    """
    Represents the parsed command-line arguments.
    """

    tests_dir: Path
    recursive: bool
    output: Path | None
    dry_run: bool
    include: list[str] | None
    include_category: list[str] | None
    include_test: list[str] | None
    exclude: list[str] | None
    exclude_category: list[str] | None
    exclude_test: list[str] | None
    verbose: int
    regex_filters: bool

def write_result(result_report: TestReport, output_file: Path | None) -> None:
    """
    Writes the final report to the specified output file or standard output if no file is provided.
    """
    result_json = result_report.model_dump_json(indent=2)
    if output_file:
        with output_file.open("w") as f:
            f.write(result_json)
    else:
        print(result_json)

def parse_arguments() -> CliArguments:
    """
    Parses the command-line arguments and performs basic validation a sanitization.
    """

    # Define the CLI arguments
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument(
        "tests_dir",
        type=Path,
        help="Path to a directory with the test cases in the SOLtest format.",
    )
    arg_parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        help="Recursively search for test cases in subdirectories of the provided directory.",
    )
    arg_parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="The output file to write the test results to. "
        "If not provided, results will be printed to standard output.",
    )
    arg_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform a dry run: discover the test cases but don't actually execute them.",
    )
    arg_parser.add_argument(
        "-i",
        "--include",
        action="append",
        nargs="*",
        help="Include only test cases with the specified name or category. "
        "Can be used multiple times to specify multiple criteria."
        "Can be combined with -ic and -it.",
    )
    arg_parser.add_argument(
        "-ic",
        "--include-category",
        action="append",
        nargs="*",
        help="Include only test cases with the specified category. "
        "Can be used multiple times to specify multiple accepted categories. "
        "Can be combined with -it and -i.",
    )
    arg_parser.add_argument(
        "-it",
        "--include-test",
        action="append",
        nargs="*",
        help="Include only test cases with the specified name. "
        "Can be used multiple times to specify multiple accepted names. "
        "Can be combined with -ic and -i.",
    )
    arg_parser.add_argument(
        "-e",
        "--exclude",
        action="append",
        nargs="*",
        help="Exclude test cases with the specified name or category. "
        "Can be used multiple times to specify multiple criteria."
        "Can be combined with -ic and -it.",
    )
    arg_parser.add_argument(
        "-ec",
        "--exclude-category",
        action="append",
        nargs="*",
        help="Exclude test cases with the specified category. "
        "Can be used multiple times to specify multiple accepted categories. "
        "Can be combined with -it and -i.",
    )
    arg_parser.add_argument(
        "-et",
        "--exclude-test",
        action="append",
        help="Exclude test cases with the specified name. "
        "Can be used multiple times to specify multiple accepted names. "
        "Can be combined with -ic and -i.",
    )
    arg_parser.add_argument(
        "-g",
        dest="regex_filters",
        action="store_true",
        help="When used, the filters specified with -i[ct]/-e[ct] will be interpreted as "
        "regular expressions instead of literal strings.",
    )

    # Parse the provided arguments
    # argparse will automatically print an error message and exit with the return code 2
    # in case of invalid arguments
    args = arg_parser.parse_args(namespace=CliArguments())

    # Check source directory
    source_directory: Path = args.tests_dir
    if not source_directory.is_dir():
        print("The provided path is not a directory.", file=sys.stderr)
        exit(1)

    # Warn if the output file already exists
    output_file: Path | None = args.output
    if output_file:
        if not output_file.parent.exists():
            print("The parent directory of the output file does not exist.", file=sys.stderr)
            exit(1)
        if output_file.exists():
            logger.warning("The output file will be overwritten: %s", output_file)

    return args

def _determine_test_type_and_codes(
    parser_codes: list[int], interpreter_codes: list[int], file_path: Path
) -> tuple[TestCaseType, list[int] | None, list[int] | None] | None:
    """
    Pomocná funkcia na určenie typu testu a očakávaných návratových kódov.
    Vráti (t_type, expected_parser, expected_interpreter) alebo None, ak test nespĺňa podmienky.
    """
    if parser_codes and not interpreter_codes:
        t_type = TestCaseType.PARSE_ONLY
        expected_interpreter = None
        expected_parser = parser_codes
    elif interpreter_codes and not parser_codes:
        t_type = TestCaseType.EXECUTE_ONLY
        expected_parser = None
        expected_interpreter = interpreter_codes
    else:
        t_type = TestCaseType.COMBINED
        expected_parser = parser_codes if parser_codes else [0]
        expected_interpreter = interpreter_codes if interpreter_codes else [0]

        if expected_parser and expected_parser != [0]:
            logger.warning(
                "Combined test case %s has parser code %s, ignoring test due to constraints.",
                file_path,
                expected_parser,
            )
            return None

    return t_type, expected_parser, expected_interpreter

def load_tests_from_directory(directory: Path, recursive: bool) -> list[TestCaseDefinition]:
    test_cases = []

    search_pattern = "**/*.test" if recursive else "*.test"

    for file_path in directory.glob(search_pattern):
        if file_path.is_file():
            test_name = file_path.stem
            category = "UNKNOWN"
            desc = None
            points = 0
            parser_codes = []
            interpreter_codes = []

            stdin_file = file_path.with_suffix(".in")
            stdout_file = file_path.with_suffix(".out")
            content = file_path.read_text(encoding="utf-8")
            lines = content.splitlines()

            for _, line in enumerate(lines):
                if line.startswith("+++"):
                    category = line[3:].strip()
                elif line.startswith("***"):
                    desc = line[3:].strip()
                elif line.startswith("!C!"):
                    parser_codes.append(int(line[3:].strip()))
                elif line.startswith("!I!"):
                    interpreter_codes.append(int(line[3:].strip()))
                elif line.startswith(">>>"):
                    points = int(line[3:].strip())

            test_config = _determine_test_type_and_codes(
                parser_codes, interpreter_codes, file_path
            )
            if test_config is None:
                continue

            t_type, expected_parser, expected_interpreter = test_config

            tc = TestCaseDefinition(
                name=test_name,
                test_type=t_type,
                description=desc,
                category=category,
                points=points,
                test_source_path=file_path,
                stdin_file=stdin_file if stdin_file.exists() else None,
                expected_stdout_file=stdout_file if stdout_file.exists() else None,
                expected_parser_exit_codes=expected_parser,
                expected_interpreter_exit_codes=expected_interpreter,
            )
            test_cases.append(tc)

    return test_cases

def get_source_code(file_path: Path) -> str:
    """Pomocná funkcia na extrakciu čistého kódu z .test súboru."""
    content = file_path.read_text(encoding="utf-8")
    lines = content.splitlines()
    for i, line in enumerate(lines):
        if line.strip() == "":
            return "\n".join(lines[i + 1 :])
    return ""

def _execute_combined_test(
    test_case: TestCaseDefinition,
    category_report: CategoryReport,
    parser_cmd: list[str],
    interpreter_cmd: list[str],
) -> None:
    source_code = get_source_code(test_case.test_source_path)

    # --- 1. KROK: SPÚŠŤANIE PARSERA ---
    # Pošleme mu zdrojový kód cez stdin
    parser_proc = subprocess.run(parser_cmd, input=source_code, text=True, capture_output=True)

    category_report.total_points += test_case.points
    if parser_proc.returncode not in (test_case.expected_parser_exit_codes or []):
        report = TestCaseReport(
            result=TestResult.UNEXPECTED_PARSER_EXIT_CODE,
            parser_exit_code=parser_proc.returncode,
            parser_stderr=parser_proc.stderr,
        )
        category_report.test_results[test_case.name] = report
        return

    xml_output = parser_proc.stdout

    with tempfile.NamedTemporaryFile(mode="w", suffix=".xml", delete=True) as temp_xml:
        temp_xml.write(xml_output)
        temp_xml.flush()  # Nutený zápis na disk pred tým, ako si ho prečíta iný proces

        # Parametre pre interpreter (predpoklad --source) - môžete upraviť podľa dizajnu
        int_cmd = [*interpreter_cmd, "--source", temp_xml.name]

        # Ak test obsahuje programový vstup (.in)
        if test_case.stdin_file:
            with Path.open(test_case.stdin_file) as f_in:
                int_proc = subprocess.run(int_cmd, stdin=f_in, text=True, capture_output=True)
        else:
            int_proc = subprocess.run(int_cmd, text=True, capture_output=True)

    if int_proc.returncode not in (test_case.expected_interpreter_exit_codes or []):
        report = TestCaseReport(
            result=TestResult.UNEXPECTED_INTERPRETER_EXIT_CODE,
            parser_exit_code=parser_proc.returncode,
            parser_stdout=parser_proc.stdout,
            parser_stderr=parser_proc.stderr,
            interpreter_exit_code=int_proc.returncode,
            interpreter_stdout=int_proc.stdout,
            interpreter_stderr=int_proc.stderr,
        )
        category_report.test_results[test_case.name] = report
        return

    # --- 3. KROK: KONTROLA VÝSTUPU POMOCOU GNU diff ---
    if int_proc.returncode == 0 and test_case.expected_stdout_file:
        # Uložíme výstup z interpretu pre komparáciu s diff
        with tempfile.NamedTemporaryFile(mode="w", delete=True) as temp_out:
            temp_out.write(int_proc.stdout)
            temp_out.flush()

            # Podla zadania bez iných parametrov
            diff_cmd = ["diff", str(test_case.expected_stdout_file), temp_out.name]
            diff_proc = subprocess.run(diff_cmd, text=True, capture_output=True)

            if diff_proc.returncode != 0:
                report = TestCaseReport(
                    result=TestResult.INTERPRETER_RESULT_DIFFERS,
                    parser_exit_code=parser_proc.returncode,
                    parser_stdout=parser_proc.stdout,
                    parser_stderr=parser_proc.stderr,
                    interpreter_exit_code=int_proc.returncode,
                    interpreter_stdout=int_proc.stdout,
                    interpreter_stderr=int_proc.stderr,
                    diff_output=diff_proc.stdout,
                )
                category_report.test_results[test_case.name] = report
                return

    report = TestCaseReport(
        result=TestResult.PASSED,
        parser_exit_code=parser_proc.returncode,
        parser_stdout=parser_proc.stdout,
        parser_stderr=parser_proc.stderr,
        interpreter_exit_code=int_proc.returncode,
        interpreter_stdout=int_proc.stdout,
        interpreter_stderr=int_proc.stderr,
    )
    category_report.test_results[test_case.name] = report
    category_report.passed_points += test_case.points

def _execute_parse_only_test(
    test_case: TestCaseDefinition,
    category_report: CategoryReport,
    parser_cmd: list[str],
) -> None:
    source_code = get_source_code(test_case.test_source_path)
    parser_proc = subprocess.run(parser_cmd, input=source_code, text=True, capture_output=True)

    category_report.total_points += test_case.points
    if parser_proc.returncode not in (test_case.expected_parser_exit_codes or []):
        report = TestCaseReport(
            result=TestResult.UNEXPECTED_PARSER_EXIT_CODE,
            parser_exit_code=parser_proc.returncode,
            parser_stdout=parser_proc.stdout,
            parser_stderr=parser_proc.stderr,
        )
        category_report.test_results[test_case.name] = report
        return

    report = TestCaseReport(
        result=TestResult.PASSED,
        parser_exit_code=parser_proc.returncode,
        parser_stdout=parser_proc.stdout,
        parser_stderr=parser_proc.stderr,
    )
    category_report.test_results[test_case.name] = report
    category_report.passed_points += test_case.points

def _execute_execute_only_test(
    test_case: TestCaseDefinition,
    category_report: CategoryReport,
    interpreter_cmd: list[str],
) -> None:
    source_code = get_source_code(test_case.test_source_path)
    category_report.total_points += test_case.points

    with tempfile.NamedTemporaryFile(mode="w", suffix=".xml", delete=True) as temp_xml:
        temp_xml.write(source_code)
        temp_xml.flush()

        int_cmd = [*interpreter_cmd, "--source", temp_xml.name]

        if test_case.stdin_file:
            with Path.open(test_case.stdin_file) as f_in:
                int_proc = subprocess.run(int_cmd, stdin=f_in, text=True, capture_output=True)
        else:
            int_proc = subprocess.run(int_cmd, text=True, capture_output=True)

    if int_proc.returncode not in (test_case.expected_interpreter_exit_codes or []):
        report = TestCaseReport(
            result=TestResult.UNEXPECTED_INTERPRETER_EXIT_CODE,
            interpreter_exit_code=int_proc.returncode,
            interpreter_stdout=int_proc.stdout,
            interpreter_stderr=int_proc.stderr,
        )
        category_report.test_results[test_case.name] = report
        return

    # --- KONTROLA VÝSTUPU POMOCOU GNU diff ---
    if int_proc.returncode == 0 and test_case.expected_stdout_file:
        with tempfile.NamedTemporaryFile(mode="w", delete=True) as temp_out:
            temp_out.write(int_proc.stdout)
            temp_out.flush()

            diff_cmd = ["diff", str(test_case.expected_stdout_file), temp_out.name]
            diff_proc = subprocess.run(diff_cmd, text=True, capture_output=True)

            if diff_proc.returncode != 0:
                print(diff_proc.stdout)
                report = TestCaseReport(
                    result=TestResult.INTERPRETER_RESULT_DIFFERS,
                    interpreter_exit_code=int_proc.returncode,
                    interpreter_stdout=int_proc.stdout,
                    interpreter_stderr=int_proc.stderr,
                    diff_output=diff_proc.stdout,
                )
                category_report.test_results[test_case.name] = report
                return

    report = TestCaseReport(
        result=TestResult.PASSED,
        interpreter_exit_code=int_proc.returncode,
        interpreter_stdout=int_proc.stdout,
        interpreter_stderr=int_proc.stderr,
    )
    category_report.test_results[test_case.name] = report
    category_report.passed_points += test_case.points

def flatten_args(arg_list: list[list[str]] | None) -> list[str]:
    if not arg_list:
        return []
    return [item for sublist in arg_list for item in sublist]

def matches_filter(value: str, patterns: list[str], is_regex: bool) -> bool:
    for p in patterns:
        if is_regex:
            if re.search(p, value):
                return True
        else:
            if p == value:
                return True
    return False

def is_test_included(tc: TestCaseDefinition, args: CliArguments) -> bool:
    includes = flatten_args(args.include)
    include_cats = flatten_args(args.include_category)
    include_tests = flatten_args(args.include_test)

    excludes = flatten_args(args.exclude)
    exclude_cats = flatten_args(args.exclude_category)
    exclude_tests = flatten_args(args.exclude_test)

    # 1. Inclusion (if any inclusion filters are provided, at least one must match)
    has_any_include = bool(includes or include_cats or include_tests)
    if has_any_include:
        included = False
        if includes and (
            matches_filter(tc.name, includes, args.regex_filters)
            or matches_filter(tc.category, includes, args.regex_filters)
        ):
            included = True
        if include_cats and matches_filter(tc.category, include_cats, args.regex_filters):
            included = True
        if include_tests and matches_filter(tc.name, include_tests, args.regex_filters):
            included = True
        if not included:
            return False

    # 2. Exclusion (if any exclusion filter matches, the test is rejected)
    excluded = False
    if excludes and (
        matches_filter(tc.name, excludes, args.regex_filters)
        or matches_filter(tc.category, excludes, args.regex_filters)
    ):
        excluded = True
    if exclude_cats and matches_filter(tc.category, exclude_cats, args.regex_filters):
        excluded = True
    if exclude_tests and matches_filter(tc.name, exclude_tests, args.regex_filters):
        excluded = True

    return not excluded

def execute_test_case(
    test_case: TestCaseDefinition, test_results: dict[str, CategoryReport]
) -> None:
    if test_results.get(test_case.category) is None:
        test_results[test_case.category] = CategoryReport(
            total_points=0, passed_points=0, test_results={}
        )

    sol2xml_path = os.environ.get("SOL2XML_PATH", "../sol2xml/sol_to_xml.py")
    solint_path = os.environ.get("SOLINT_PATH", "../int/dist/solint.js")

    parser_cmd = ["python3", sol2xml_path]
    interpreter_cmd = ["node", solint_path]

    category_report = test_results[test_case.category]

    if test_case.test_type == TestCaseType.COMBINED:
        _execute_combined_test(test_case, category_report, parser_cmd, interpreter_cmd)
    elif test_case.test_type == TestCaseType.PARSE_ONLY:
        _execute_parse_only_test(test_case, category_report, parser_cmd)
    elif test_case.test_type == TestCaseType.EXECUTE_ONLY:
        _execute_execute_only_test(test_case, category_report, interpreter_cmd)


def main() -> None:
    """
    The main entry point for the SOL26 integration testing script.
    It parses command-line arguments and executes the testing process.
    """

    # Set up logging
    # IPP: You do not have to use logging – but it is the recommended practice.
    # See this for more information: https://docs.python.org/3/howto/logging.html
    logging.basicConfig(
        stream=sys.stderr,
        level=logging.WARNING,
        format="%(asctime)s %(levelname)s [%(name)s][%(filename)s:%(lineno)d] %(message)s",
    )

    # Parse the CLI arguments
    args = parse_arguments()

    test_cases = load_tests_from_directory(args.tests_dir, args.recursive)
    test_results: dict[str, CategoryReport] = {}
    unexecuted: dict[str, UnexecutedReason] = {}

    for tc in test_cases:
        if not is_test_included(tc, args):
            unexecuted[tc.name] = UnexecutedReason(
                code=UnexecutedReasonCode.FILTERED_OUT, message="Test was filtered out."
            )
            continue

        if args.dry_run:
            unexecuted[tc.name] = UnexecutedReason(
                code=UnexecutedReasonCode.OTHER, message="Dry run."
            )
            continue

        execute_test_case(tc, test_results)

    # Example of how to write the final report:
    report = TestReport(
        discovered_test_cases=test_cases, unexecuted=unexecuted, results=test_results
    )
    write_result(report, args.output)


if __name__ == "__main__":
    main()
