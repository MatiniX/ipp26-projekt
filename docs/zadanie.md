# Zadání projektu z předmětu IPP

**Ondřej Ondryáš, Zbyněk Křivka**  
e-mail: {iondryas, krivka}@fit.vut.cz  
20. února 2026

## Obsah

1 Obecné informace 1  
2 Zadání 2  
3 Implementační jazyk a nástroje pro udržení kvality kódu 3  
4 Kontejnerizace 5  
5 Hodnocení 6  
6 Využití AI nástrojů 6  
7 Dokumentace 7  
8 Odevzdávaný archiv 8  
9 Specifikace testovacího nástroje 9

---

## 1 Obecné informace

**Název projektu:** Interpret objektového jazyka SOL26.  
**Informace:** diskuzní fórum a e-learning (Moodle) předmětu IPP.  
**Registrace varianty:** do pátku 27. února 2026, 23:59.  
**Hlavní odevzdán��:** neděle 12. dubna 2026, 23:59.  
**Odevzdání dokumentace a vylepšení:** středa 22. dubna 2026, 23:59.  
**Maximální hodnocení:** 20 bodů.

**Hlavní cíle projektu:**

- Seznámit se s technikami potřebnými pro provádění objektově orientovaných programů.
- Vhodně využít objektový návrh pro implementaci software.
- Seznámit se s různými nástroji a přístupy pro zajištění kvality kódu a odhalování chyb.
- Vyzkoušet si správu prostředí pro rozsáhlejší projekt skládající se ze samostatných součástí.
- Implementovat mechanismus pro integrační testování.
- Seznámit se s technikou kontejnerizace software.
- Trénovat schopnost v psaní výstižné dokumentace k projektu.
- Naučit se, jak vhodným způsobem využívat asistenci AI nástrojů.

**Termíny odevzdávání:**
Kompletní implementaci projektu (včetně testování a kontejnerizace) odevzdáte nejpozději 12. 4. do StudISu pod zadání „Projekt – Registrace a hlavní odevzdání“. Během několika dnů pak dostanete e-mail s výsledky automatického testování a odhadem bodového ohodnocení. Podrobné informace ke struktuře archivu jsou uvedeny v sekci 8.

Nejpozději 22. 4. pak odevzdáte pod zadání „Projekt – Dokumentace/vylepšení“ vypracovanou dokumentaci (věnujte velkou pozornost sekci 7). Zároveň máte možnost na základě zpětné vazby z hlavního odevzdání v projektu opravit chyby a odevzdat vylepšenou verzi implementace. Pozor, opravdu musí jít o vylepšení něčeho, co už při hlavním odevzdání rozumně fungovalo – nestačí odevzdat prakticky nefunkční pokus a pak se snažit to dohnat. Za hranici pro „rozumné fungování“ považujeme cca 25% úspěšnost testů implementace. Sporné případy (např. řešení, ve kterých vlivem „hloupé chyby“ neprojdou všechny testy) budeme řešit individuálně – konkrétní informace dostanete v e-mailu s hodnocením.

Pokud nechcete (či nemůžete) odevzdat vylepšené řešení, odevzdejte pouze PDF nebo MD soubor s dokumentací. V opačném případě odevzdejte archiv obsahující dokumentaci (podle sekce 8).

**Zdroje informací:**

- E-learning (Moodle) předmětu IPP:
  - často kladené otázky (FAQ),
  - fórum k projektu.
- Git repozitář projektu (pozor, dostupné jen ze sítě FIT – odjinud je nutné využít VPN).
- Cvičicí: Ondřej Ondryáš – konzultace na fóru, na discordu v kanálu `#ipp-public`, příp. osobní konzultace po dohodě e-mailem.
- Garant projektu: Zbyněk Křivka – konzultace na fóru, na discordu v kanálu `#ipp-public`, příp. osobně v konzultačních hodinách (vizte webovou stránku) nebo po dohodě e-mailem (uvádějte předmět začínající `IPP:`).
- Garant předmětu: Dušan Kolář (jen v závažných případech a po vyčerpání všech možností výše) – e-mailem (uvádějte předmět začínající `IPP:`).

Pokud máte jakékoliv dotazy, problémy či nejasnosti ohledně zadání projektu, tak po přečtení FAQ a dřívějších dotazů na fóru (využívejte i možnosti vyhledávání!) neváhejte napsat nejlépe na fórum, případně na discord do kanálu `#ipp-public`. Čas od času si fórum přečtěte, i pokud nemáte žádné otázky, neboť se zde mohou vyskytnout závazná vyjasnění zadání.

V případě individuálních problémů, které nevychází přímo z nejasnosti v zadání, se co nejdříve ozvěte cvičícímu či garantovi projektu (příp. nouzově garantovi předmětu). Organizační problémy (tj. týkající se registrací, odevzdávání, hodnocení atp.) řešte výhradně s garantem projektu, dr. Křivkou (cvičicího můžete případně uvést do kopie e-mailu). Na problémy zjištěné v řádu hodin až jednotek dní před termínem odevzdání nebude brán zřetel. Začněte proto projekt řešit s dostatečným předstihem.

## 2 Zadání

**Interpret**
Navrhněte, implementujte (s využitím poskytnuté šablony, viz sekci 3) a zdokumentujte program, který bude interpretovat jednoduchý imperativní, třídní, čistě objektově orientovaný programovací jazyk SOL26, který je detailně popsán v samostatném dokumentu Specifikace jazyka SOL26 Ş. Interpret neprovádí syntaktickou analýzu, jeho vstupem bude abstraktní syntaktický strom ve značkovacím jazyce XML, jehož struktura je přesně popsána tamtéž Ş.

Interpret načte program a s využitím vstupu dle parametrů příkazové řádky jej interpretuje a generuje jeho výstup (na standardní výstup). Součástí specifikace je také popis návratových kódů, se kterými interpret končí v případě chyby. Dodržení těchto kódů je důležité pro správné hodnocení projektu. V git repozitáři k projektu je podrobně popsáno rozhraní příkazové řádky interpretu (načítání parametrů řeší šablona, viz sekci 3).

Požadujeme, aby byla implementace provedena s vhodným využitím objektové orientace. Pečlivě zvažte využití vhodných návrhových vzorů (dle přednášek a doporučení uvedených v e-learningu). Dbejte na vhodnou dekompozici problému, navrhujte interpret s ohledem na budoucí rozšiřitelnost interpretovaného jazyka.

**Testovací nástroj**
Dále implementujte (s využitím šablony) jednoduchý nástroj, který bude provádět end-to-end[^1] testování interpretu. Jeho vstupem bude cesta k adresáři s testovacími programy zapsanými v jazyce SOL26. Program nejprve spustí (námi dodaný) překladač do jazyka XML, v případě úspěchu pak spustí váš interpret a zkontroluje správnost výstupu programu. Výstupem bude report o výsledcích testování, který bude mít předem danou strukturu a bude serializován ve formátu JSON.

Testovací nástroj bude jednoduchý, není zde vyžadován důkladný objektový návrh (ačkoliv je velmi vhodné jej alespoň částečně využít). Cílem je, abyste si vyzkoušeli více programovacích jazyků a prostředí pro řešení praktického problému.

**Kontejnerizace**
Pro intepret i testovací nástroj vytvoříte také soubor typu `Containerfile` (též `Dockerfile`), který slouží pro sestavení obrazu kontejneru, ve kterém bude interpet přeložen, spuštěn i testován (viz sekci 4).

## 3 Implementační jazyk a nástroje pro udržení kvality kódu

Do pátku 27. 2. si ve StudISu zaregistrujte jednu variantu v sekci „Projekt – Registrace a hlavní odevzdání“. Tímto způsobem si vyberete dvojici jazyků z následující nabídky:

- Python (3.14),
- TypeScript (5.9) v prostředí Node.js (24.12 LTS nebo 25.2),
- PHP (8.5).

Využijte verzi jazyka, která je uvedená v závorce (uvádíme maximálně minor verzi, tj. pokud se verzuje např. ve formátu X.Y.Z a uvedeno je jen X.Y, použijte nejnovější verzi, kde se shoduje X.Y, totéž platí i pro další použité nástroje popsané níže).

Sami si pak zvolte, který z jazyků využijete pro implementaci interpretu a který pro testovací nástroj (v každém případě musíte využít oba jazyky).

Pro všechny uvedené jazyky je v git repozitáři dostupná základní šablona pro obě úlohy, jejíž použití je povinné. Obsahuje počáteční konfiguraci projektu a potřebných nástrojů, předpřipravený kód pro načítání parametrů a vstupu či objektový model pro vstupní reprezentaci programu. Do souborů šablony nezasahujte, pokud to výslovně neumožňují komentáře (může to být důvodem pro bodovou srážku). Pokud do nich zasáhnout budete potřebovat, diskutujte to nejprve na fóru s cvičicím.

### Knihovny a zakázané prostředky

V obou částech projektu je obecně zakázáno používat knihovny třetích stran. Pokud nějakou knihovnu chcete využít, napište na fórum, o jakou knihovnu jde a proč její použití považujete za nutné a/nebo přínosné. Seznam schválených knihoven (pokud takové budou) najdete v e-learningu. Bez schválení můžete využít libovolné prostředky standardních knihoven a knihoven, které jsou už definovány v šabloně. Ve všech případech však platí následující omezení:

- V interpretu je zakázáno cokoliv zapisovat do souborového systému, otvírat jakákoliv síťová spojení a spouštět jakékoliv procesy. Dále je zakázáno spouštět dynamicky vytvořený kód (tj. ve všech jazycích funkce `eval`, v Pythonu také `exec`), neboť cílem projektu je vypracovat interpret, ne transpiler.
- V testovacím nástroji je zakázáno otvírat jakákoliv síťová spojení.

### Udržení kvality kódu

V praxi se velmi často využívají zhruba tyto tři typy nástrojů, které si v projektu vyzkoušíte:

**Formatter** je nástroj, který zajišťuje konzistentní formátování (styl zápisu) kódu, obvykle na základě nakonfigurovaných pravidel (některé nástroje však vynucují jeden konkrétní styl formátování bez větších možností konfigurace (v angličtině se někdy označují termínem opinionated).

**Linter** je nástroj, který provádí statickou analýzu za účelem odhalení potenciálních chyb, podezřelých konstrukcí a dalších možných problémů (např. bezpečnostních).

**Type checker** je nástroj, který se využívá v dynamicky typovaných jazycích pro doplnění statické typové kontroly. (V kompilovaných jazycích typové kontroly provádí překladač.)

Následují povinné požadavky pro jednotlivé jazyky a mechanismy pro udržování kvality kódu a odhalování chyb, které v nich máte využít. Další informace a konfigurační soubory, které budou s jednotlivými nástroji užity, jakož i podrobnější instrukce k jejich instalaci a použití jsou dostupné v git repozitáři.

Pro všechny jazyky a nástroje obecně platí, že je zakázáno používat prostředky, které pro nějakou část konkrétní kódu vypnou konkrétní kontrolu, varování, upozorňování na možnou chybu apod. (obvykle speciální komentáře, např. `# mypy: allow-untyped-defs`, `@phpstan-ignore`).

Jejich lokální použití je v ojedinělých případech prominutelné, pokud v dokumentaci důkladně vysvětlíte, proč bylo naprosto nevyhnutelné (což ale typicky není pravda – doporučujeme konzultovat na fóru).

Plného počtu bodů z hodnocení kvality kódu dosáhnete, pokud ani jeden z nástrojů nezahlásí žádnou chybu ani žádné upozornění (případně pokud bude v dokumentaci pečlivě vysvětleno, proč jsou vygenerovaná upozornění tzv. „false positive“ a ve skutečnosti neplatí).

#### Python

Kód bude zformátován a zkontrolován pomocí nástroje Ruff (0.14). Nástroj obsahuje režim formatter i režim linter – využijte oba. Dále kód musí projít statickými typovými kontrolami nástrojem Mypy (1.19). Z tohoto důvodu bude mj. nutné minimálně všechny funkce a metody opatřovat typovými anotacemi.
V kontejneru zajistěte spustitelnost Ruff pomocí `./ruff` a Mypy pomocí `./mypy`.

#### TypeScript (TS)

Kód bude zkontrolován pomocí linteru ESLint (9.32) s rozšířením typescript-eslint (8.52). Kód bude zformátován nástrojem Prettier (3.7). Typovou kontrolu zajišťuje překladač TypeScriptu, který bude nakonfigurován s parametrem `strict` spolu s dalšími možnostmi pro omezení typových chyb (viz šablonu).
V kontejneru zajistěte spustitelnost ESLint pomocí `./eslint` a Prettier pomocí `./prettier`.

#### PHP

Pro kontrolu kódu využijte nástroj PHPStan (2.1), a to minimálně na úrovni 8. Správné formátování kontrolujte nástrojem PHP_CodeSniffer (4.0) nastaveným pro soulad se standardem PSR-12.
V kontejneru zajistěte spustitelnost PHPStan pomocí `./phpstan` a PHP_CodeSniffer pomocí `./phpcs`.

## 4 Kontejnerizace

Pro projekt vytvoříte soubor typu `Containerfile`[^2], který slouží jako sada instrukcí k sestavení obrazu kontejneru. Váš `Containerfile` bude obsahovat alespoň následující pojmenované stupně (stage):

- **check** vytvoří prostředí, ve kterém bude možné spustit požadované nástroje pro udržení kvality kódu, a to pro obě části projektu. Vstupním bodem výsledného obrazu bude bash. Do kontejneru budou z hostitelského stroje připojeny (jako bind mount) adresáře s interpetem (do `/src/int`) i adresář s testovacím nástrojem (do `/src/tester`). V shellu pak budou v těchto adresářích spouštěny příslušné nástroje pro udržení kvality kódu, jak je uvedeno v sekci 3 (je nutné zajistit správné předávání argumentů příkazové řádky!).
- **build** a **build-test** (pouze TS) provede překlad zdrojového kódu interpretu/testovacího nástroje. Budeme automaticky analyzovat výstup překladače, je proto důležité, abyste neměnili v šabloně použitou konfiguraci překladu.
- **runtime** vytvoří obraz kontejneru, který přímo spouští váš interpret. Tento obraz by měl být co nejodlehčenější, neměly by se v něm nacházet závislosti pro vývoj, nástroje pro kontrolu kvality kódu atp. Speciálně v případě TS to znamená, že tento stupeň z výstupu předchozího stupně pouze zkopíruje přeložené soubory (direktiva `COPY --from=build`), tedy aby se v obrazu kontejneru už nenecházel zdrojový kód a překladač.
- **test** bude vycházet z předchozího stupně (direktiva `FROM runtime`), přičemž ale bude spouštět váš nástroje pro integrační testování (ten bude v případě TS opět pouze zkopírován ze stupně build-test).

Velice obrysové ukázky podobných Containerfile souborů i způsobu, jakým budeme vaše Containerfile soubory používat při našem testování, jsou k dispozici v git repozitáři k projektu.

Očekává se, že vaše Containerfile soubory by měly být ekvivalentně použitelné s platformou Docker i Podman. Abychom však zabránili případným problémům, můžete si vybrat, kterým systémem budeme obrazy kontejnerů překládat. Ve výchozím stavu bude překlad proveden pomocí Docker 29.13 s docker buildx 0.30[^4]. Pokud do odevzdaného souboru na první řádek uvedete komentář `### podman`, bude obraz přeložen pomocí podman 5.7[^5]. Vaše kontejnery musí být možné přeložit a spustit na platformě x86_64.

V případě, že nebude vaše kontejnerizace funkční, pokusíme se spustit programy i nástroje v blíže nespecifikovaném prostředí s využitím zvyklostí běžných pro zvolené jazyky. Pokud se touto cestou spuštění podaří (což nelze garantovat), očekávejte cca 25–40% bodovou srážku z celkového hodnocení implementace (dle závažnosti problému s kontejnerizací).

## 5 Hodnocení

Maximální hodnocení je 20 bodů, z toho až:

- 4 b za hodnocení návrhu a rozšiřitelnosti (podle popisu v dokumentaci),
- 3 b za hodnocení dokumentace jako celku (úprava, stručnost vyjadřování při zachování informační bohatosti atp.),
- 13 b za implementaci a kvalitu kódu dle výrazu

`i ⋅ 7 + t ⋅ 3 + max( (2i + t)/3, 0.42 ) ⋅ k ⋅ 3`

kde `i, t ∈ ⟨0, 1⟩` jsou poměry (úspěšných : všech) testů implementace (`i`) a testovacího nástroje (`t`); `k ∈ ⟨0, 1⟩` je koeficient vycházející z množství chyb/varování reportovaných sledovanými mechanismy pro udržení kvality kódu.

Upozorňujeme, že hodnocení návrhu a dokumentace má silnou, leč implicitní souvislost s kvalitou implementace: za sotva fungující řešení pravděpodobně nezískáte plné množství bodů z dokumentace.

Lze také získat až 5 bonusových bodů, a to za implementaci bonusových rozšíření, tvůrčí přístup, zajímavé řešení, odhalení chyb v zadání nebo aktivitu na fóru. Nelze však získat více než 50 % bodů z vašeho individuálního hodnocení základní funkčnosti.

Připomínáme, že udělení zápočtu z IPP je podmíněno získáním min. 20 bodů v průběhu semestru.

**Poznámka:** Odnést byste si z projektu měli především pochopení různých principů a úskalí OOP. Dbejte hlavně na to, aby se váš interpret správně choval pro správné programy – v testování se příliš nezaměřujeme na chybové vstupy. Pokud zadání/specifikace jazyka nějaký detail chování nespecifikuje, můžete jej probrat se cvičícími nebo ostatními kolegy/-němi řešícími projekt, ale typicky platí, že je to zcela na vás.

## 6 Využití AI nástrojů

Záměrem projektu je, abyste vy rozšířili své dovednosti a znalosti, projekt má vznikat díky vaší inteligenci. Nástroje „umělé inteligence“, např. generativní jazykové modely, však mají v tomto procesu své místo. Je dovoleno je používat jako podporu při vypracovávání projektu. Vhodným a povoleným použitím je:

- dovysvětlení nejasných částí zadání,
- zapojení do procesu vzniku „vysokoúrovňového“ návrhu architektury řešení,
- vysvětlení použití některých nástrojů či konkrétních funkcí/metod/knihoven,
- hledání problémů a chyb (nejlépe konkrétních) ve vámi napsaném kódu,
- kontrola pravopisu, gramatiky a stylistiky ve vámi napsané dokumentaci,
- vytváření testů.

V každém případě je nutné, abyste projekt stále řešili vy, a ne AI nástroj. Je důležité, abyste si sami pečlivě pročetli celé zadání a na jeho základě sami uvážili, jakým směrem při návrhu řešení postupovat. Na projektech na FIT byste se měli naučit především vyvíjet inženýrskou činnost: programátorem může b��t do značné míry AI, ale softwarovými inženýry\*inženýrkami máte být vy. Jedním z cílů projektu je však i procvičit vaše vývojářské schopnosti, proto není vhodné nechat AI nástroj vygenerovat značnou část implementace.

Explicitně zakazujeme použití AI pro generování dokumentace! Dokumentace má především zachycovat vaše myšlenky a způsob řešení, který jste vy navrhli, nedává tedy smysl, aby ji napsal jazykový model. Je však v pořádku „konzultovat“ s AI nástroji výhradně jazykové záležitosti (formulace, stylistiku).

Při posuzování vhodnosti použití prostředků AI klademe důraz na transparentnost. V dokumentaci uveďte, jaké AI nástroje jste použili, a popište, jaký byl váš typický pracovní postup při jejich použití. K projektu povinně přiložte také kopie svých konverzací s chatboty (nejlépe odkaz na konverzaci, který bude alespoň do konce semestru platný, případně kompletní, navazující snímky obrazovky) nebo obdobné materiály, které konkrétně ukazují, jak jste AI využívali.

Přečtěte si zásady uvedené v dokumentu Užívání generativní AI na VUT v Brně vč. Doporučení pro oblast vzdělávání. Tyto zásady považujeme pro účely projektu za závazné. Upozorňujeme, že nedovolené a nepřiznané použití nástrojů AI, jakož i vydávání cizího díla za vlastní, popřípadě převzetí části cizí práce bez uvedení použitých zdrojů [...] jsou disciplinární přestupky.

## 7 Dokumentace

Dokumentace implementace musí být stručným a uceleným průvodcem vašeho způsobu řešení. Popisujete v ní povinně pouze řešení interpretu, testovací nástroj nemusíte popisovat (až na využití AI). Bude vytvořena ve formátu PDF nebo Markdown[^6]. Pokud odevzdáváte vylepšenou verzi řešení, dokumentace bude popisovat tuto vylepšenou verzi, ne původně odevzdanou.

Dokumentaci je možné psát česky, slovensky (v obou případech s diakritikou) nebo anglicky. Hodnotíme jak obsahovou stránku, tak i stylistiku, pochopitelnost, strukturu a sazbu (v případě značkovacího formátu Markdown vhodné použití značek).

Dokumentace by měla obsahovat alespoň následující části. Rozsahy v závorce považujte za doporučený, spíše horní limit délky. V dokumentaci nechceme číst omáčku, ale co nejvíce podstatných informací v ucelené a stručné podobě (toto bude i hodnoceno)!

- Celkový popis návrhu řešení – „jak to vlastně celé funguje“ (cca 3–5 odstavců + UML diagram, viz dále),
- popis hlavních interních datových struktur – jejich významu, ne nutně položku po položce (cca 2 věty na strukturu),
- využití návrhových vzorů a principů OOP – jaké, kde, z jakého důvodu, jak přispívají k organizaci/rozšiřitelnosti (cca 1 delší odstavec na vzor),
- případně popis největších problémů či sporných situací, na které jste při řešení narazili, a způsob, jakým jste je řešili (cca 1 odstavec na problém),
- případně provedené zásahy do šablony apod.,
- případně rozsah a důvod úprav ve vylepšené verzi (cca 1 odstavec),
- zamyšlení nad možnostmi dalšího rozšiřování (cca 1 odstavec na rozšíření, viz dále),
- případně citace převzatých zdrojů ve všech částech projektu (neuvádějte šablonu),
- popis využití prostředků AI ve všech částech projektu (viz sekci 6).

Pište dokumentaci s vědomím, že čtenář zná zadání, tudíž je v ní zbytečné projekt představovat či vysvětlovat, co projekt dělá – rovnou vysvětlete, jak toho docílil. Dbejte na správnost použité terminologie. Obvykle není vhodné do dokumentace kopírovat úryvky zdrojového kódu. Identifikátory je vhodné sázet fontem s pevnou šířkou znaků (v Markdownu do značek `\``, v LATEX např. `\texttt`).

**Rozšiřitelnost**
Po hlavním odevzdání zveřejníme v e-learningu seznam několika možných rozšíření jazyka a interpretu. Z tohoto seznamu si vyberte alespoň dvě položky a v dokumentaci popište, jak by bylo možné díky vašemu dobrému návrhu vybraná rozšíření implementovat.

**Diagram tříd**
Povinnou součástí dokumentace je UML diagram tříd v souladu s přednáškami (nebo specifikací UML). Zahrňte v něm i třídy poskytnuté v rámci šablony, ty však můžete uvádět ve zkrácené formě (tj. bez atributů a metod, ale se zachováním vztahů mezi nimi). Vámi neimplementované části UML diagramu vhodně odlište (např. sazbou šedou barvou).

## 8 Odevzdávaný archiv

Do StudISu odevzdáte jeden archiv zkomprimovaný ve formátu ZIP. V kořeni budou pouze:

- adresář `int` se zdrojovým kódem interpretu,
- adresář `tester` se zdrojovým kódem testovacího nástroje,
- soubor `Containerfile` nebo `Dockerfile`,
- soubor `dokumentace.md` nebo `dokumentace.pdf` (pouze při odevzádání vylepšení!),

V souladu se sekcí 6 v případě využití AI nástrojů přiložte také soubor(y) ve formátu Markdown nebo PDF se jménem „`ai-[název AI nástroje].md/pdf`“, které budou obsahovat doklady o využití AI (pokud nejsou zahrnuty jako odkazy v dokumentaci).

Adresáře se zdrojovými kódy musí přímo obsahovat konfigurace potřebných nástrojů, tak, jak jsou k dispozici v šabloně. V případě TS a PHP bude v adresáři také přímo definice projektu (soubor `package.json` / `composer.json`). V případě Pythonu záleží, jaký způsob správy projektu zvolíte. Přímo po rozbalení archivu tedy bude možné sestavovat kontejnery způsobem popsaným v sekci 4.

Názvy všech souborů a adresářů mohou obsahovat pouze písmena anglické abecedy, číslice, tečku, podtržítko (a pouze v nezbytných případech spojovník).

Archiv nesmí obsahovat žádné binární spustitelné soubory nebo jiné přeložené artefakty, skryté adresáře (s tečkou na začátku) vč. adresáře `.git`, adresáře s virtuálními prostředími (např. Python), adresář `node_modules`, adresář(e) `__MACOSX` nebo `.DS_Store`.

## 9 Specifikace testovacího nástroje

Testovací nástroj bude program bez uživatelského rozhraní, který na základě parametrů příkazové řádky:

1. načte z požadovaného adresáře definice testů (ve formátu popsaném níže),
2. vybere jejich podmnožinu podle požadovaných filtrů,
3. pro testy, které to vyžadují, spustí dodaný překladač SOL2XML,
4. provede kód pomocí vašeho interpretu,
5. srovná očekávané návratové kódy a případně výstupy,
6. a uloží strukturovaný report o výsledcích testování ve formátu JSON.

### Struktura testu

Test je definován následujícími položkami:

- název (implicitní – název souboru bez přípony),
- krátký popis (nepovinné),
- kategorie (povinná),
- bodová váha testu (povinné),
- zdrojový kód v jazyce SOL26 nebo XML (povinné),
- obsah standardního vstupu pro interpretaci (nepovinné),
- očekávaný obsah standardního výstupu interpretu (nepovinné),
- očekávané návratové kódy překladače SOL2XML (povinné, pokud je zdrojový kód v jazyce SOL26),
- očekávané návratové kódy interpretu (povinné, pokud je zdrojový kód v jazyce XML).

Nástroj tedy v principu podporuje tři typy testů: pouze překlad pomocí SOL2XML, pouze interpretaci a překlad následovaný interpretací.

Test je zadán textovým souborem s příponou `.test`, který má následující formát:

```text
*** [kratky popis]
+++ [kategorie]
!C! [navratovy kod prekladace]
!I! [navratovy kod interpetu]
>>> [bodova vaha]
[prazdny radek]
[zdrojovy kod]
```

Všechny položky nad zdrojovým kódem se mohou vyskytovat v libovolném pořadí a ty, které podporují více hodnot, se mohou opakovat vícekrát. Příklad (kategorie BASIC, povolené návratové kódy intepretu 0 a 42, bodová váha 2):

```sol26
+++ BASIC
*** Test jednoducheho programu
!C! 0
!I! 0
!I! 42
>>> 2

class Main : Object {
run [ | ]
}
```

### Standardní vstup interpretovaného programu

Pokud má být interpretovanému programu předán nějaký vstup, je nutné, aby vedle souboru s popisem testu existoval také stejně pojmenovaný soubor s příponou `.in`, jehož obsah bude použit. Pokud soubor neexistuje, není interpretovanému programu předán žádný vstup.

### Kontrola standardního výstupu interpretovaného programu

V případě, kdy vedle souboru s popisem testu existuje také soubor s příponou `.out`, provádí testovací nástroj v případě úspěšného dokončení intepretovaného programu (návratový kód 0) také kontrolu shody standardního výstupu programu. Ten je proveden pomocí nástroje GNU `diff`[^7] bez dalších parametrů. Nástroj `diff` po spuštění vypisuje rozdíly v souborech a jeho návratový kód určuje, zda se soubory lišily, nebo ne. Pokud se lišily, testovací případ se považuje za nesplněný a rozdíl (tedy výstup nástroje `diff`) je uložen do reportu (viz dále).

Pokud soubor s příponou `.out` neexistuje, standardní výstup se nekontroluje (ale stále se ukládá do reportu, viz dále).

**Poznámka:** U testů, které testují pouze překlad ze SOL do XML, není možné ověřovat shodu výstupu, provádí se zde pouze kontrola návratového kódu.

### Výstupní report

Výstupní report obsahuje:

- seznam všech načtených testů, kde je každý reprezentován objektem obsahujícím načtená metadata testu (pokud se povedlo jej načíst),
- slovník všech nespuštěných testů s informací, proč nebyl spuštěn,
- slovník kategorií, kde každá položka je slovník všech výsledků spuštěných testů, kde je každý reprezentován objektem obsahujícím:
  - informaci o módu testování (pouze překlad ze SOL do XML/pouze interpretace/obojí),
  - výsledek testu,
  - návratové kódy překladače/interpretu,
  - zachycený standardní výstup i standardní chybový výstup překladače/interpretu a případně standardní výstup nástroje `diff`.

Příklady konkrétních výstupních reportů s různými kombinacemi najdete v git repozitáři k projektu. Přesný datový model, který se do výstupního JSON souboru serializuje, je obsažen a řádně okomentován v šabloně projektu.

### Spouštění nástroje

Nástroj má právě jeden poziční parametr příkazové řádky, a to cestu (absolutní nebo relativní) k adresáři s testy. Dále podporuje volitelné parametry:

- `--recursive` / `-r`: adresář s testy projde rekurzivně, tj. testy bude hledat i v podadresářích.
- `--output=<file>` / `-o <file>`: nastaví cestu k výstupnímu souboru, do kterého bude zapsán výstupní report ve formátu JSON. Pokud není přítomen, report se vypíše na standardní výstup.
- `--dry-run`: provede pouze načtení testů, ty se ale nebudou spouštět. Výstupní report pak nebude obsahovat slovník s výsledky spuštěných testů.
- `--help` / `-h`: vypíše pouze nápovědu k nástroji a jeho parametrům a ukončí program.

Dále nástroj podporuje volitelné parametry pro filtrování testů, které mají být spuštěny:

- `--include=<id>` / `-i <id>`: spustí pouze testy, jejichž název nebo kategorie se shoduje s hodnotou `<id>`
- `--exclude=<id>` / `-e <id>`: vynechá všechny testy, jejichž název nebo kategorie se shoduje s hodnotou `<id>`
- `--include-category=<id>` / `-ic <id>`, `--include-test=<id>` / `-it <id>`
- `--exclude-category=<id>` / `-ec <id>`, `--exclude-test=<id>` / `-et <id>`
  obdobné jako výše, ale filtruje pouze podle kategorie/názvu

Každý z parametrů výše může být použit vícekrát. Množina testů k provedení se určí jako všechny testy odpovídající libovolné hodnotě include mínus všechny testy odpovídající libovolné hodnotě exclude. Pokud není předán žádný include parametr, výchozí množinou jsou všechny nalezené testy. Z hodnot `<id>` odstraňujte případné bílé znaky (mezery apod.) na začátku a konci.

Jako dobrovolné rozšíření můžete podporovat na místech `<id>` také regulární výrazy. S hodnotami všech definovaných filtrů se bude pracovat jako s regulárními výrazy pouze tehdy, když je zároveň použit parametr `-g`. Pro práci s regulárními výrazy použijte standardní knihovnu zvoleného jazyka.

Příklad překladu kontejneru a spuštění:

```bash
docker build --target test --tag mytesttool .
docker run --rm -v ../testdata:/opt/tests mytesttool \
-r -o /opt/tests/report.json -ic basic -et aaa -et bbb /opt/tests
```

Sestaví obraz kontejneru (stupeň test) a označí jej tagem `mytesttool`. Poté spustí nový kontejner (parametr `--rm` zajistí, že po skončení bude odstraněn) a do souborového systému kontejneru připojí lokální složku `../testdata`, aby se nástroj dostal k lokálně uloženým testům.

Hledá testy rekurzivně v adresáři `/opt/tests` (do kterého je připojena lokální složka), spouští pouze testy s kategorií či jménem `basic`, ale vynechá test s názvem `aaa` a `bbb` (pokud takové neexistují, nic zvláštního se nestane). Výstup uloží do souboru `/opt/tests/report.json` (na hostitelském stroji tedy bude k dispozici na cestě `../testdata/report.json`).

---

[^1]: Termínem end-to-end testing se v praxi často označuje testování celé aplikace (obvykle takové, která se skládá z více součástí) „od začátku do konce“, tj. tak, jak by ji využíval uživatel. V našem případě se dá předpokládat, že hypotetický uživatel jazyka SOL26 by chtěl vyvíjet přímo v tomto jazyce, a ne v jeho XML reprezentaci, proto je nutné testovat různé scénáře, ve kterých na začátku stojí kód v jazyce SOL26 a na konci je výstup jeho interpretace.

[^2]: Containerfile je označení, které se používá především v kontextu ekosystému Podman. Ačkoliv jde formálně o samostatnou specifikaci, v praxi jde o totéž, co jsou soubory Dockerfile. Doporučujeme řídit se referenčním manuálem na webu Dockeru. Odevzdaný soubor se může jmenovat Containerfile i Dockerfile.

[^4]: Viz `docker --version`.

[^5]: Viz `podman --version`.

[^6]: Bude-li přítomna dokumentace v Markdown i PDF, bude hodnocena verze v PDF, kde je jistější sazba. Jakékoliv jiné formáty dokumentace než PDF či Markdown budou ignorovány, což povede ke ztrátě bodů za dokumentaci.

[^7]: Nástroj diff je standardní součástí GNU/Linux distribucí i macOS, na Windows doporučujeme vyvíjet ve WSL2, ale je možné využít i diff přeložený pro Windows.
