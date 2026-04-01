class Main : Object {
    run [|
        "Kandidat na chybu 52 (ostatna behova chyba):"
        "whileTrue: dostane telo, ktore nie je block/object s korektnym spravanim"
        "a podmienka vracia true."
        cond := [| r := true. ].
        _ := cond whileTrue: 123.
    ]
}