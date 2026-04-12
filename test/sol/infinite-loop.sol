class A : Object {
    greet [ |
         c := C new.
         _ := c greet.   "loops infinitely"
         _ := 'A' print.
     ]
}

class B : A {
    greet [ |
        _ := super greet. "calls A.greet"
        _ := 'B' print.
    ]
}

class C : B {
    greet [ |
        _ := super greet.  "calls B.greet"
        _ := 'C' print.
    ]
}

class Main : Object {
    run [ |
        o := C new.
        _ := o greet.
    ]
}