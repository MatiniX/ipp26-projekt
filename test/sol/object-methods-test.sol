class Main : Object {
    run [|
        nl := '\n'.

        o1 := Object new.
        o2 := Object new.
        o3 := o1.

        "identicalTo:"
        _ := ((o1 identicalTo: o1) asString) print.
        _ := nl print.
        _ := ((o1 identicalTo: o2) asString) print.
        _ := nl print.

        "equalTo: on Object without internal attrs behaves like identity"
        _ := ((o1 equalTo: o3) asString) print.
        _ := nl print.
        _ := ((o1 equalTo: o2) asString) print.
        _ := nl print.

        "asString on Object should be empty string"
        s := o1 asString.
        out := '<' concatenateWith: s.
        out := out concatenateWith: '>'.
        _ := out print.
        _ := nl print.

        "Object type predicates"
        _ := ((o1 isNumber) asString) print.
        _ := nl print.
        _ := ((o1 isString) asString) print.
        _ := nl print.
        _ := ((o1 isBlock) asString) print.
        _ := nl print.
        _ := ((o1 isNil) asString) print.
        _ := nl print.
        _ := ((o1 isBoolean) asString) print.
        _ := nl print.
    ]
}