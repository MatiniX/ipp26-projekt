class MyNil : Nil {
}

class Main : Object {
    run [|
        nl := '\n'.

        "Nil singleton behavior"
        n1 := Nil new.
        n2 := Nil from: nil.
        n3 := nil.

        _ := ((n1 identicalTo: n2) asString) print.
        _ := nl print.
        _ := ((n2 identicalTo: n3) asString) print.
        _ := nl print.
        _ := ((n1 equalTo: n3) asString) print.
        _ := nl print.

        _ := (n1 asString) print.
        _ := nl print.

        _ := ((n1 isNil) asString) print.
        _ := nl print.
        _ := ((n1 isBoolean) asString) print.
        _ := nl print.
        _ := ((n1 isNumber) asString) print.
        _ := nl print.

        "Subclass of Nil is not singleton for new/from:"
        s1 := MyNil new.
        s2 := MyNil new.
        s3 := MyNil from: nil.

        _ := ((s1 identicalTo: s2) asString) print.
        _ := nl print.
        _ := ((s1 identicalTo: s3) asString) print.
        _ := nl print.

        _ := ((s1 isNil) asString) print.
        _ := nl print.
        _ := ((s1 equalTo: s1) asString) print.
        _ := nl print.
        _ := ((s1 equalTo: s2) asString) print.
        _ := nl print.
    ]
}