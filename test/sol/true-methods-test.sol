class Main : Object {
    run [|
        nl := '\n'.

        t1 := True new.
        t2 := True from: true.

        "singleton behavior"
        _ := ((t1 identicalTo: t2) asString) print.
        _ := nl print.
        _ := ((t2 identicalTo: true) asString) print.
        _ := nl print.

        "basic True methods"
        _ := (t1 asString) print.
        _ := nl print.
        _ := ((t1 not) asString) print.
        _ := nl print.
        _ := ((t1 isBoolean) asString) print.
        _ := nl print.

        "and: evaluates argument block"
        side := 0.
        _ := (((t1 and: [| side := side plus: 1. r := true. ]) asString) print).
        _ := nl print.
        _ := (side asString) print.
        _ := nl print.

        "or: on true short-circuits (does not evaluate argument)"
        side2 := 0.
        _ := (((t1 or: [| side2 := side2 plus: 1. r := false. ]) asString) print).
        _ := nl print.
        _ := (side2 asString) print.
        _ := nl print.

        "ifTrue:ifFalse: executes first branch"
        _ := ((t1 ifTrue: [| r := 'T'. ] ifFalse: [| r := 'F'. ]) asString) print.
        _ := nl print.
    ]
}