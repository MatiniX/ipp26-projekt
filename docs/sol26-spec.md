# Specifikace jazyka SOL26 (IPP 2025/2026)

## Ondřej Ondryáš, Zbyněk Křivka

# Obsah

## 1 Popis jazyka SOL26 1

## 1.1 Lexikální jednotky................................. 2

## 1.2 Syntaxe a sémantika jazykových konstrukcí.................... 2

## 1.2.1 Výrazy a selektory............................. 3

## 1.2.2 Blok..................................... 3

## 1.2.3 Příkaz přiřazení............................... 4

## 1.2.4 Proměnné a rozsah platnosti........................ 4

## 1.2.5 Blok jako objekt.............................. 4

## 1.2.6 Výsledek bloku............................... 5

## 1.2.7 Reference na příjemce zprávy self.................... 5

## 1.2.8 Klíčové slovo super............................ 6

## 1.2.9 Výrazy a zasílání zpráv........................... 6

## 1.2.10 Třídy, instanční metody a atributy..................... 7

## 1.2.11 Příklady................................... 10

## 2 Vestavěné třídy SOL26 12

## 3 Přehled chybových návratových kódů 15

## 4 Popis XML reprezentace programu 16

# Úvod

## Tento dokument popisuje jazyk SOL26, pro který budete implementovat interpret. Jazyk je popsán

## v jeho čitelné podobě, tedy pomocí lidsky čitelné syntaxe a lexikálních pravidel. S využitím této

## syntaxe je pak vysvětlena sémantika, tj. chování jednotlivých konstrukcí jazyka.

## Pozor, váš interpret na vstupu nebude dostávat programy přímo v čitelné podobě jazyka SOL26, ale

## převedenéztétosyntaxedoformátuSOL-XML,cožjeabstraktnísyntaktickýstromreprezentovaný

## ve formátu XML (podrobně popsán v sekci 4 ). Překladač SOL2XML (překládá z jazyka SOL26 do

## formátu SOL-XML), který můžete využít při tvorbě vlastních experimentálních programů v jazyce

## SOL26, je dostupný v git repozitáři k projektu.

## Při implementaci a odevzdávání se nezapomeňte řídit pokyny vhlavním zadání Şa v README

## souborech, které jsou součástí šablony projektu v git repozitáři.

# 1 Popis jazyka SOL

## SOL26 je interpretovaný, imperativní, netypovaný, třídní objektově orientovaný programovací ja-

## zyk s dynamickou typovou kontrolou. Je volně inspirován vlastnostmi a syntaxí jazyka Smalltalk.

## Podporuje definice tříd s instančními metodami a atributy, jednoduchou třídní dědičnost a poly-

## morfní invokaci metod. Obsahuje několik vestavěných tříd (s třídními i instančními metodami),

## uživatel může definovat vlastní třídy. Syntaxe jazyka (v jeho lidsky čitelné podobě) je jednoduchá,

## aby bylo možné jej snadno převést na abstraktní syntaktický strom (AST), který bude (ve formátu

## SOL-XML) hlavním vstupem interpretu ve vašem projektu.

### Všechny hodnoty (tj. výsledky výrazů a hodnoty referencované v proměnných nebo instančních

### atributech^1 ) jsou objekty, tedy instance nějaké třídy. SOL26 využívá referenční sémantiku , což

### znamená, že typem proměnné je třída objektu, který je referencován touto proměnnou.

## 1.1 Lexikální jednotky

### V SOL26 záleží na velikosti písmen u identifikátorů i klíčových slov (je case-sensitive ).

- _Identifikátor_ je neprázdná posloupnost číslic, písmen (malých i velkých) začínající malým pís-

### menem; nebo případně speciální identifikátor ’ \_ ’ pro označení proměnné, která není dále po-

### užita. Jazyk SOL26 obsahuje navíc níže uvedená klíčová slova , která mají specifický význam,

### a proto se nesmějí vyskytovat jako identifikátory nových proměnných či jako selektory:

### Klíčová slova: class , self , super , nil , true , false

- _Identifikátor třídy_ má stejné podmínky jako _identifikátor_ , ale začíná velkým písmenem. SOL

### také obsahuje vestavěné třídy (viz sekci 2 ) Object , Nil , True , False , Integer , String ,

### Block.

### Základním a jediným nositelem typu je třída. Pro jednoduchost není třeba pracovat s třídami

### jako s objekty první kategorie^2.

- _Pravdivostní literál_ je vyjádřen klíčovým slovem **true** pro pravdu nebo klíčovým slovem **fal-**

### se pronepravdu.Tatoklíčováslovaseinterpretujíjakoinstancetříd True a False (vizsekci 2 ).

### Jde přitom o jedináčky ( singleton ), tj. tyto třídy mají v programu jediné instance zastoupené

### právě klíčovými slovy true a false.

- _Celočíselný literál_ je tvořen neprázdnou posloupností číslic a vyjadřuje hodnotu celého čísla

### v desítkové soustavě s nepovinným unárním znaménkem (+ nebo -). Literál se interpretuje jako

### instance třídy Integer (klasický celočíselný rozsah implementačního jazyka interpretu).

- _Řetězcový literál_ je oboustranně ohraničen jednoduchými uvozovkami (’ **'** ’) a je reprezentován

### instancí třídy String. Tvoří jej libovolný počet znaků zapsaných mezi uvozovkami na jednom

### řádku. Možný je i prázdný řetězec ( '' ). Další znaky lze zapisovat pomocí escape sekvence:

### ’ \' ’, ’ \n ’, ’ \\ ’ (význam je standardní).

- _Blokový literál_ slouží pro zápis imperativního kódu. Tvoří jej _definice parametrů_ a _sekvence_

### příkazů přiřazení uzavřená v hranatých závorkách. Obě části mohou být prázdné.

#### [ sekvence deklarací parametrů | sekvence příkazů přiřazení ]

### Detailní popis syntaxe a sémantiky blokového literálu je v sekci1.2.2.

- _Neplatná hodnota_ jereprezentovánaklíčovýmslovem **nil** (chováseobdobnějakopravdivostní

### literály – nil představuje jedinou instanci jedináčka Nil ).

- _Blokový komentář_ je ohraničen dvojitými uvozovkami (’ **"** ’).

## 1.2 Syntaxe a sémantika jazykových konstrukcí

### Program v jazyce SOL26 se skládá ze sekvence definic tříd. Jedna z definovaných tříd musí být

### hlavní třídaMains bezparametrickou metodourun(příp. chyba 31 ). Interpret po spuštění auto-

(^1) Výjimkou jsou _interní instanční atributy_ , které si pro instance objektů udržuje interpret, ale přímo z jazyka nejsou

##### dostupné.

(^2) To znamená, že třída samotná se v základním zadání nebere jako plnohodnotný objekt, tj. není možné ji např.

##### referencovat z proměnné. Pro účely instanciace se však může vyskytnout na místě adresáta zprávy, kterým je jinak

##### typicky instance třídy (objekt).

### maticky vytvoří instanci třídyMaina zašle jí zprávu (zavolá metodu)run.

### Před, za i mezi jednotlivými tokeny se může vyskytovat libovolný počet bílých znaků, takže jed-

### notlivé konstrukce jazyka SOL26 lze zapisovat na jednom či více řádcích. Za každým příkazem se

### píše tečka (’. ’). Prázdný příkaz není dovolen. Na jednom řádku lze zapsat více příkazů.

### Rozsáhlejší příklad programu je uveden níže v sekci1.2.11.

### 1.2.1 Výrazy a selektory

### V jazyce je k dispozici pouze jeden druh příkazu, a to přiřazení výsledku výrazu do proměnné.

### Výrazem je literál, proměnná, nebo zaslání zprávy. Zaslání zprávy se skládá z operandu (výraz,

### který se vyhodnotí na objekt, který bude příjemcem zprávy) a selektoru zprávy s případnými argu-

### menty této zprávy (opět výrazy). Pomocí zasílání zpráv se realizuje jak invokace metod, tak přístup

### k instančním atributům objektů, a představuje tak primární způsob řízení toku programu.

### Selektor zprávy slouží pro identifikaci zprávy při jejím zasílání (proloženo případnými argumen-

### ty) a pro definici jména metody reagující na zaslanou zprávu, kterou instance třídy přijímá. Skládá

### se z jednoho či více identifikátorů dle toho, zda je bezparametrický, nebo s parametry. Identifiká-

### tory se mohou opakovat. Vyjma bezparametrického selektoru se bezprostředně za každým identi-

### fikátorem píše dvojtečka, počet dvojteček selektoru tak udává počet argumentů zprávy. Příklady

### selektorů:

### run bezparametrický selektor.

### plusOne: selektor s jedním parametrem.

### startsWith:endsBefore: selektor se dvěma parametry.

### Při zasílání zprávy s daným selektorem se za každou dvojtečkou očekává výraz pro odpovídající

### argument zprávy. Příklady použití:

### x := someExpr1 run. nepředává argumenty.

### y := expr2 plusOne: 10. předává jako argument hodnotu 10.

### z := e3 startsWith: 5 endsBefore: y. předávájakoargumentyhodnotu5ahodnotu,

### kterou referencuje proměnnáy.

### 1.2.2 Blok

### Blok je objekt, který obsahuje sekvenci příkazů, kterou je možné vyhodnotit. Literál bloku:

#### [ sekvence deklarací parametrů bloku | sekvence příkazů přiřazení ]

### jeuzavřenvhranatýchzávorkách.Prvníčástobsahujeseznamparametrů,kterýmůžebýtiprázdný.

### Deklarace jednoho parametru se skládá z dvojtečky bezprostředně (bez bílých znaků) následované

### identifikátorem. Příklad:

[ | a := 1. ] "Blok bezparametrů"
[ :x|a := x. ] "Blok sjedním parametrem"
[ :x :y:z | a := x plus: y. ] "Blok se třemi parametry"

### Následuje povinné svislítko ’ | ’ oddělující sekvenci příkazů přiřazení. Každý příkaz je ukončen

### tečkou. Proměnné uvnitř bloku nejsou dopředu deklarovány a jsou vytvářeny implicitně přiřaze-

### ním objektu příkazem přiřazení. Parametry bloku se chovají jako nemodifikovatelné proměnné

### definované na začátku bloku.

### 1.2.3 Příkaz přiřazení

### Příkaz přiřazení je jediným druhem příkazu v jazyce SOL26.

#### proměnná := výraz.

### Všechny jeho části jsou povinné a je zakončen tečkou.

### 1.2.4 Proměnné a rozsah platnosti

### Proměnné jazyka SOL26 jsou pouze lokální v blocích a lexikálně zanořených blocích (něco jiného

### jsou atributy objektů, viz sekci1.2.10). Proměnná je definována prvním přiřazením v daném bloku

### ajeviditelnáivlexikálnězanořenýchblocích,atoivpřípadě,žejsoutakovéblokypředánypomocí

### parametrů či instančních atributů jinam, kde mohou být později provedeny. SOL26 tedy podporuje

### uzávěry (angl. closures), v sekci1.2.11je uveden příklad. Při pokusu o přiřazení do formálního

### parametru dojde k chybě 34.

### Při pokusu o čtení neinicializované proměnné (např. ve výrazu) dojde k sémantické chybě 32.

### Blok tvoří tzv. rozsah platnosti , ve kterém jsou dostupné uvnitř bloku definované proměnné. Lo-

### kální proměnné mají tedy rozsah platnosti od místa jejich definice až po konec bloku, kde byly

### definovány, včetně lexikálně zanořených bloků.^3. V každém bloku jsou navíc k dispozici objekty

### nil , true , false s globální viditelností.

### Tvoří-li blok tělo metody (tzv. metodový blok ), obsahuje tento blok (i jeho podbloky) pseudopro-

### měnné self a super (viz sekci1.2.7).

### 1.2.5 Blok jako objekt

### Blok je v SOL26 také objektem – instanci vestavěné třídy Block (viz také sekci 2 ). Je tedy možné

### mu zasílat zprávy (tj. invokovat jeho instanční metody), referencovat jej z proměnné, předávat jej

### jako argument ve zprávě. Příklad:

###### [|

"Blok bezparametrů přiřazený do 'b1'"
b1 := [ | a := **String** read. _ := a print. ].
"Blok sjedním par.přiřazený do 'b2'.
S arg., který má rozumětzprávě plus:apo provedení by vracel objekt prox +
1."
b2 := [ :x | _ := x plus: 1. ].
"Blok se dvěma par.přiřazený do 'b3'.
Při vyhodnocení očekává v'x' libovolnýobjekt,
který umí zprávu 'value:' -tedy např. jinýblok."
b3 := [ :x:y | val := x **value** : y. ].
"Provedení bezparam. bloku =poslání zprávy'value' objektub1"
\_ := b1 **value**.
"Provedení dvouparam.bloku zasláním zprávy'value:value:' sargumenty
'b2' a'3' objektub3. V'c'budehodnota 4."
c := b3 **value** : b2 **value** : 3.
]

### Literál bloku při definici není hned vykonán! Uvedením literálu bloku na nějakém místě programu

### vznikne instance Block. Sekvenci příkazů uvnitř bloku je pak možné provést zasláním patřičné

### zprávy:

(^3) Pozor, jde opravdu jen o _lexikálně_ zanořené bloky. Pokud např. do metody přijde instancebjiného bloku jako

##### argument,připrovedenítohotoblokubnejsoudostupnélokálníproměnnémetodovéhobloku,zekteréhobylbspuštěn.

- pokud je literálem bloku definovaná instanční metoda ve třídě (jde o _metodový blok_ ), provede

### se obsah bloku zasláním zprávy s příslušným selektorem instanci této třídy (viz sekci1.2.10);

- pokud podle literálu bloku vznikl objekt, který je referencovaný z nějaké proměnné, provede se

### obsahblokuzaslánímzprávy value (příp. value: , value:value: atd.podlepočtuparametrů

### bloku; zaslání zprávy se špatnou aritou vede na chybu 51 ) tomuto objektu.

### 1.2.6 Výsledek bloku

### Výsledkem provedení bloku je hodnota posledního vyhodnoceného výrazu v posledním provede-

### ném příkazu bloku. Pokud žádný výraz vyhodnocen nebyl, výsledkem je nil.

class **Main** : **Object** {
**run** [|
a :=self foo: 4. "a =instance 14 "
b := [ :x | _ := 42. ]. "b=instance Block"
c := b **value** : 16. "c= instance 42 "
d := **'ahoj'** print.]"d =instance 'ahoj' -print vrací self,viz Vestavěné
třídy"
foo: [ :x |
"sproměnnou 'u'se nijak dálnepracuje, alevýsledek zaslání
zprávy'plus:' budevrácen jakovýsledek volání metody 'foo'"
u := x plus: 10.
]
}

### 1.2.7 Reference na příjemce zprávyself

### Při invokaci metody je prostředí odpovídajícího metodového bloku doplněno o předinicializova-

### nou nemodifikovatelnou (pseudo)proměnnou self , která referencuje objekt, který zprávu přijal.

### V lexikálně zanořených blocích je self (a super ) z metodového bloku viditelné a dostupné stejně

### jako ostatní proměnné.

### Uvažujme složitější příklad níže, který demonstruje statický rozsah platnosti pseudoproměnné

### self. Pseudoproměnná self je uvnitř bloku navázána v době definice bloku na instanci, která

### je kontextovým objektem provádění metody, která tento blok obsahuje, a to i zanořeně. Blok si tu-

### to referenci pro self pamatuje po zbytek své existence a při provádění bloku je tato reference

### využita (i když je blok prováděn třeba v kontextu jiného objektu).

class **Main** : **Object** {
**run** [|
a := A **new**.
"Instance bloku si zapamatuje,že selfodkazuje na tutoinstanci Main.Blok
navíc tutoreferenci na konci vrací."
b := [ :arg | y := selfattr: arg. z := self. ].
"Zavoláme metodu'foo' na instanci Aapředáme jí objekt 'b'typu Block."
c := a foo: b.
"Výsledkempřiřazeným do cje instance třídy Main sinstančním atributem
attrinicializovaným na 'foo'- můžemevypsat."
\_ := (selfattr) print.
]
}
class A : **Object** {
foo: [ :x |
"Blokpředanýv xje vyhodnocen ado instance Main je jímvytvořen instanční
atributattr shodnotou 'foo'."
u := x **value** : **'foo'**. ]
}

### 1.2.8 Klíčové slovosuper

### Dále je dostupné klíčové slovo super , které odkazuje na stejný objekt jako self , ale při použití

### na místě příjemce zprávy upravuje, kde se bude hledat metoda odpovídající selektoru. Metoda

### bude nejprve vyhledávána až v přímé nadtřídě třídy, v jejíž metodě je zaslání zprávy realizováno,

### a pak postupně hledá v dalších nadtřídách. Díky tomu je možné vynutit provedení původní metody

### v případě její redefinice.

### Pokud je super někam přiřazeno nebo předáno jako argument, chová se jako synonymum pro

### self.

class A : **Object** {
m: [ :x | _ := x print. ]
r [ | _ :=self print. ]
}

class B : A { "Bdědí zA,redefinuje metodum"
m: [ :x | _ :=super m: **'ahoj'**. "super -> použije se implementacez A"
_ := x print. ]
}

class C : B {
"selfmnajde metodu m znadtřídy Ba pošle jí jakoargument instanci C (na
místě argumentu má super stejný významjako self)."
u [ | _ :=self m: super. ]
print [ | **'bar'** print. ]
}

class **Main** : **Object** {
**run** [ | c := C **new** ."Vytvoří instanci ctřídy C."
"Této instanci pošle zprávu m-> implementace se najde vB.m (z B)
nejprvezavolá implementaci zA,což vypíše'ahoj'. Pak m(zB)
zavolána argumentu print,takže se vypíše 'foo'."
_ := c m: **'foo'**.
"Instanci c se pošle zpráva u, odpovídajícímetoda zavolá m(najde se v
B) sargumentemsuper (= self).Ta pak volám (z A), která pošle
svému argumentuzprávu print.Metoda protuto zprávu se najde vC,
protožeinstance Cje tím objektem,který se poslal jakoargument x."
_ := c u.
"Instanci c pošle zprávu r. Implementacese najde vA.Tatometoda
posíládo self zprávuprint.Protože selfje vtomto kontextu
instancí C, instance použijesvou metoduprint (definována vC)a
vypíšese 'bar'."
_ := c r.
]
}

### 1.2.9 Výrazy a zasílání zpráv

### Výrazem je literál, proměnná, nebo zaslání zprávy. Výsledkem výrazu je vždy objekt. Literálem

### může být číslo, řetězec, identifikátor třídy nebo blok. Výrazem je také proměnná včetně true ,

### false , nil , self , super.

### Každé zaslání zprávy (mimo takové, které na nejvyšší úrovni leží bezprostředně za ’ := ’) musí

### být uzavřeno v závorkách. Formálněji řečeno, zaslání zprávy není asociativní a všechny zprávy

### (bezparametrické i s parametry) mají stejnou prioritu.

### V případě klasického zaslání zprávy je na místě příjemce zprávy výraz , který se vyhodnotí na

### objekt; zpráva je pak určena selektorem. Příklad příkazu přiřazení s výrazem zaslání zprávy se

### dvěma argumenty:

x := targetExpression selector: arg1Expression arg: arg2Expression.

### Jednotlivými argumenty jsou opět výrazy – při zaslání zprávy se tyto výrazy nejprve vyhodnotí

### zleva doprava^4 a reference na výsledné objekty se použijí jako argumenty zprávy (tj. předají se do

### těla invokovaného bloku).

class **Main** : **Object** {
**run** [|
"výraz zaslánízprávy vargumentu je už nutné uzávorkovat"
a :=self attrib: ( **Integerfrom** : 10).
"vnořenázaslánízprávy,kde je výsledek užitjako cílpro další zprávu"
b := [| x := ((selfattrib) asString) concatenateWith: (10 asString). ].
]
}

### Vestavěné třídy nabízejí několik vestavěných třídních metod v roli konstruktoru (např. new ne-

### bo from: ), které jsou invokovány zasláním třídní zprávy , kdy je příjemce vyjádřen literálem pro

### identifikátor třídy:

x := **Stringfrom** : **'Test\n'**.

### Není možné vytvářet vlastní (uživatelské) třídní metody. Pokud třída nerozumí zaslané třídní zprá-

### vě, vede to na statickou chybu 32.

### 1.2.10 Třídy, instanční metody a atributy

### Definice třídy se skládá z klíčového slova class následovaného identifikátorem třídy, dvojtečkou

### a identifikátorem nadtřídy (angl. superclass ). Uvedení nadtřídy je povinné (nemůže se tak stát, že

### by předkem třídy nebyl Object ). Tělo třídy je ohraničeno závorkami ’ { } ’, uvnitř těla se nachází

### žádnáčivíceinstančníchmetod.Invokacíkonstruktoruvznikáinstancetřídy(čilikonkrétníobjekt).

### Té je možné zasílat zprávy, kterým instance rozumí , tj. vlastní třída nebo nadtřída metodu reagující

### na zprávu definuje. Pokud zaslanou zprávu třída nepodporuje (tj. neexistuje metoda nebo instanční

### atribut odpovídající selektoru), program končí s chybou 51 , že instance nerozuměla zprávě.

### Všechny identifikátory tříd (vestavěné i uživatelem definované) mají globální viditelnost.

### Instanční metody

### Definice instančních metod jsou v těle třídy ve tvaru:

#### selektor [ "blokový literál s odpovídajícím počtem parametrů" ]

### Blokový literál uvedený za selektorem reprezentuje tělo metody (nesouhlasí-li arita selektoru

### a bloku, dojde k sémantické chybě 33 ). Při zaslání zprávy instanci nejprve dojde k vyhledání od-

### povídající instanční metody (dle souhlasného selektoru a stejné arity) ve vlastní třídě příjemce.

### V invokované metodě je navázána pseudoproměnná self na příjemce zprávy a jednotlivým para-

### metrům jsou přiřazeny hodnoty argumentů (výrazy argumentů jsou vyhodnoceny postupně zleva

### doprava). Jako výsledek metody je navrácen výsledek bloku reprezentujícího tělo invokované me-

### tody.

### Instančnímetodyjsoudotřídyzděděnyzjejíchpředků. Zděděnouinstančnímetodulzevpotomko-

### vi redefinovat (angl. override ). Při přijetí zprávy se metoda hledá nejprve ve vlastní třídě příjemce,

### pak postupně v jeho předcích.

(^4) Povšimněte si, že je použita vyhodnocovací strategie _eager evaluation_.

### Přetěžování (angl. overloading ), tj. použití stejného selektoru pro více různých implementací me-

### tod, není v SOL26 podporováno.

### Instanční atributy

### Uživatelsky definovaný instanční atribut není deklarován ve třídě^5 , ale je vytvářen a inicializo-

### ván programově pomocí jednoparametrického selektoru^6. Výsledkem inicializační/nastavovací

### zprávy instančního atributu je self (tj. odkaz na instanci s modifikovanou hodnotou onoho atri-

### butu).

### Přístup k hodnotě dříve definovaného instančního atributu provádíme bezparametrickou zprávou

### se selektorem odpovídajícím identifikátoru atributu. Nelze vytvořit instanční atribut, jehož čte-

### ní^7 by se krylo s existující bezparametrickou instanční metodou (vč. zděděných) příjemce (jinak

### chyba 54 ).

class **Main** : **Object** {
**run** [|
"definuje ainicializuje instanční atribut'value'"
r :=self **value** : 10.
"definuje další inst. atribut'next', inicializuje hodnotou atributu 'value'"
e :=self next: (self **value** ).
"atribut'value'již existuje,takže pouze modifikuje hodnotuna nil"
t :=self **value** :nil.
"CHYBA 54!Třída definuje metodufoo, jméno nelze použít jakoatribut."
_ :=self foo: 10.
]

foo [|]
}

### Protože jsou instanční atributy vázány na konkrétní objekt (instanci), nemá smysl (v kontextu dě-

### dičnosti) uvažovat u nich pojem redefinice (na rozdíl od metod). Pro účely nastavování instančních

### atributů a přístupu k nim se self a super chovají obvykle jako synonyma – výjimkou je právě

### kontrola kolizí s definovanými metodami, která při použití super uvažuje jen metody definované

### na nadtřídách, zatímco při použití self uvažuje i metody definované vlastní třídou příjemce. Může

### se tedy např. stát, že třída definuje instanční metodu, která překryje instanční atribut vzniklý např.

### v nějaké metodě nadtřídy. V tomto případě lze k instančnímu atributu přistoupit pomocí super.

class Parent : **Object** {
something [|
"definuje ainicializuje instanční atributy 'p'a 'q'"
p :=self p: **'hello'**.
q :=self q: **'world'**.
"Je-li příjemce instance Parent,získá hodnotu v'p'avytiskne 'hello'."
"Je-li příjemce instance Main,reagujeinvokací metody 'p'avypíše 'foo'."
_ := (selfp) print. ] }
class **Main** : Parent {
**run** [|
"tytočtyři příkazymají stejný efekt"
a :=super **value** :super. b :=super **value** :self.
c :=self **value** :super. d := self **value** : self.

```
x :=self p: 'val' ."CHYBA 54! Vedlo by na vznik atributu,ale už máme
instanční metodup,takže atribut nelze vytvořit."
```

(^5) Podobně jako v jazyce Python 3.
(^6) Instanční atribut tedy vznikne, pokud zašleme zprávu s jedním parametrem, které příjemce zatím „nerozumí“.
(^7) Z podstaty věci nelze vytvořit ani instanční atribut, pro který by vznikla kolize se zapisovací zprávou (jeho vznik

##### by se provedl posláním takové zprávy, na kterou už příjemce umí odpovědět).

```
x :=self p. "hodnotou xbude'foo'"
```

```
x :=super something: 1. "CHYBA 54!Vedlo by na vznik atributu,ale v
nadtřídě je koliznímetoda."
x :=super p. "CHYBA 51! Nadtřída nezná selektor p.(something se zatím
neprovedla)"
```

```
_ :=super something. "nastavíatributy p,qa vypíše 'foo'"
x :=self p. "x ='foo'(volání metody)"
y :=super p. "y= 'hello'(přístupk atributu)"
z :=self q. "q ='world' (přístup katributu)"
]
```

p [|
"instančnímetoda, která jen vrátí řetězec'foo'"
_ := **'foo'**.
]
}

### Všechny instanční atributy (vyjma interních) jsou veřejné (angl. public ). Přístup k zatím nedefino-

### vanému instančnímu atributu vede na interpretační chybu 51.

### Především z pohledu implementace obsahují objekty také interní instanční atributy. Jde např.

### o skutečnou numerickou hodnotu objektu, který reprezentuje celé číslo, nebo o identifikátor ob-

### jektu. Tyto atributy objektů jsou užity pouze pro interní účely interpretace, jsou naplněny během

### instanciace a uživatelsky (z kódu SOL26) nejsou přístupné ani modifikovatelné.

### Konstruktory

### Za účelem vytváření instancí tříd existují v jazyce také dvě třídní metody, které fungují jako kon-

### struktory. Formálně jsou tyto metody definovány na třídě Object , díky dědičnosti jsou pak i ve

### všech jejích podtřídách. Chování třídních metod není možné uživatelsky měnit, metody nelze rede-

### finovat (angl. override ). Vestavěná třída String nad rámec následujících dvou konstruktorů ještě

### další třídní metodu (konstruktor) read , viz níže.

### new bezparametrická třídní metoda, která vytvoří novou instanci dle třídy příjemce a případně

### inicializuje interní instanční atributy implicitními hodnotami (viz sekci 2 ).

### from: třídní metoda s jedním parametrem (zde označený za obj ), která vytvoří novou instanci

### třídy, která tuto třídní zprávu přijala, a inicializuje:

- interní instanční atributy kopií hodnot těchto atributů z _obj_ ,
- instanční atributy tzv. mělkou kopií hodnot všech instančních atributů z _obj_ (to znamená,

### že vytvořená instance bude mít všechny instanční atributy, které má obj , a ty budou

### referencovat stejné objekty, které jsou referencovány z obj ).

### Pokud definuje přijímající třída interní instanční atribut, je nutné, aby jej měl k dispozici

### i objekt obj (jinak chyba 53 ).

### Příklad použití from:

```
class Factorial : Integer {
factorial "použitífrom:pro podtřídu třídy Integer"
[| r := (selfequalTo: 0) ifTrue: [|r := Factorial from : 1.]
ifFalse: [|r := selfmultiplyBy:
((Factorial from : (self plus: -1)) factorial). ].
]
}
```

```
class Main : Object {
run
[| x := Factorial from : (( String read) asInteger).
x := ((x factorial) asString) print.
```

```
"CHYBA 53!Factorial dědíz Integer,tudíž obsahuje interní instanční
atributs číselnou hodnotou -řetězec takovýinterní atributnemá"
y := Factorial from : 'str'.
]
}
```

### 1.2.11 Příklady

### Demonstrace metod, selektorů, základního zasílání zpráv

class **Main** : **Object** {
**run** "<- definice metody -bezparametrický selektor run"
[ |
"Zašle zprávu 'compute:and:and:' soběsamému -selektor se dvěma arg."
x := selfcompute: 3 and: 2 and: 5.
"Nejprvezašle zprávu 'vysl'objektuself (bezparametrický selektor). Pak
zašle zprávu 'plusOne:' (selektor s jednímparametrem) soběsamému -
hodnotou argumentu je výsledek předchozí zprávy."
x := selfplusOne: (selfvysl).
"Zašle zprávu 'asString'objektu x-bezparametrický selektor."
y := x asString.
]

```
plusOne: "<- definice metody - selektor sjedním parametrem"
[ :x | r := x plus: 1. ]
```

compute:and:and: "<- definice metody- selektor se třemi parametry"
[ :x :y :z |
"Zašle zprávu 'plus:' objektu x-selektor s jedním parametrem."
a := x plus: y.
"Zašle zprávu 'vysl:' sobě samému- nastavíinstanční atribut'vysl'."
_ := selfvysl: a.
"Pošle si zprávu 'vysl', výsledkem je ref.na objekt referencovaný
atributem vysl;tomuto objektupak zašle zprávu 'greaterThan:', jejím
argumentem je 0."
_ := ((selfvysl) greaterThan: 0)
"Výsledkem je objekt typuTruenebo False,kterému se zašle zpráva
'ifTrue:ifFalse:',argumenty jsoubezparametrické bloky."
ifTrue: [|u := self vysl: 1.]
ifFalse: [|].
]
}

### Povšimněte si, že identifikátor se může v selektoru opakovat. Selektor vyjadřuje pouze „rozhraní“

### zprávy – předané argumenty jsou vázány na parametry bloku podle deklarovaného pořadí, ne podle

### identifikátoru v selektoru.

### Demonstrace uzávěrů

### Předpokládejte, že na standardním vstupu programu se nachází1\n2\n3\n4\n.

class **Main** : **Object** {
giveObjectWithBlock [ |
"Načte řádek avytvoří objekt pročíslo 1."
x := (( **String** read) asInteger).
"Vytvoříblok,který lzeopakovaně vyhodnotit.Součástí bloku je v uzávěru
odkaz na lokální proměnnou x."
b := [| y := (( **String** read) asInteger) plus: x. ].
"Vytvoříinstanci třídy Objecta vní rovnou vytvoříinstanční atribut
block,do kteréhonastaví výševytvořený blok."
x := 7.
z := (( **Object new** ) block: b).
"Projevíse i vuzávěru bloku."
x := 9.
"Zde metodakončí,ale proměnná xstále „žije“ v uzávěrubloku b.
Následující příkaz způsobí,že giveObjectWithBlock vrátí vytvořený
objekt zjako svounávratovou hodnotu."
\_ := z.
]

**run** "vstupníbod programu"
[ |
"Vytvoříobjekt sblokem."
o := selfgiveObjectWithBlock.
"Načte řetězec'2' (první načteníjiž proběhlo)."
_ := **String** read.
"Vrámci vyhodnocení bloku načte číslo 3, vrací 12 (9 +3)."
r1 := ((o block) **value** ).
"Vrámci vyhodnocení bloku načte číslo 4, vrací 13 (9 +4)."
r2 := ((o block) **value** ).
]
}

# 2 Vestavěné třídy SOL

## Vestavěné instanční metody, které vyžadují jako argument instanci, která rozumí zprávě value či

## value: (např. bezparametrický blok a blok s jedním parametrem), a nedostanou ji, způsobí chybu

## 51.

## TřídaObject

## Instanční metody:

## identicalTo: Testuje shodu dvou objektů, tj. že se jedná o tentýž objekt.

## equalTo: Datově porovná objekt: pokud objekt nemá interní atributy, invokuje identicalTo: ,

## jinak porovnává interní atributy (v potomcích je možné equalTo: redefinovattak, abyvhod-

## ně porovnávala i instanční atributy).

## asString Vrací řetězec '' (v potomcích redefinováno rozumnější implementací).

## isNumber,isString,isBlock,isNil Vrací false. V potomcích jsou redefinovány tak, že vra-

## cí true , pokud je příjemce instance Integer / String / Block / Nil (nebo jejich podtřídy).

## isBoolean Vrací false. V potomcích True a False je redefinována tak, že vrací true.

## TřídaNil : Object

## Třída Nil je implementována jako jedináček. Konstruktory new i from: vždy vrací stejnou instan-

## ci Nil , která je totožná s globálně dostupným objektem nil^8. Třídní zprávy new a from: se pro

## případné podtřídy Nil chovají jako jiné běžné uživatelsky definované třídy (již nezajišťují jedináč-

## ka).

## Instanční metody:

## asString Vrací řetězec 'nil'.

## TřídaInteger : Object

## Instance této třídy zastupují celá čísla. Odpovídající celé číslo je uloženo v interním instančním

## atributu. Výchozí hodnota (při použití Integer new ) je 0.

## Použitím celočíselného literálu vzniká instance třídy Integer , přičemž není definováno, zda jde

## pro konkrétní literál vždy o stejnou instanci. Je tedy možné (ale ne nutné), aby byla identita nějaké

## instance Integer nebo její podtřídy vztažená právě k internímu atributu s hodnotou – konstruktor

## from: může vrátit existující instanci. Příklad:

class MyInt : **Integer** { }
class **Main** : **Object** {
**run** [|
x := 1. y := 1. z := **Integer from** : 1.
u := MyInt **from** : 1. w := MyInt **from** : 1.

```
a := x equalTo: y. a := x equalTo: z. "obojí true"
a := x identicalTo: y. "podle implementace"
a := x identicalTo: z. "podle implementace"
```

```
a := u equalTo: x. a := u equalTo: w. "obojí true"
a := u identicalTo: x. "false"
```

(^8) Není tedy možné získat dvě instance **Nil** , pro které by **identicalTo:** vrátila **false**.

a := u identicalTo: w. "podle implementace"
]
}

### Instanční metody:

### equalTo: Porovná, zda je číselná hodnota (v interním instančním atributu) příjemce a argumentu

### shodná.

### greaterThan:,plus:,minus:,multiplyBy: Standardní numerické operace.

### divBy: Celočíselné dělení kompatibilní s implementačním jazykem interpretu^9. Dělení nulou ve-

### de na chybu 53.

### asString Vrací číslo převedené na řetězec v desítkové reprezentaci a s případným znaménkem

### mínus (kladné znaménko se vynechává).

### asInteger Vrací sebe sama.

### timesRepeat: Jako argument očekává instanci, která rozumí zprávě value:^10. Pokud (a jen teh-

### dy, když) je příjemce𝑛 > 0, blok z argumentu se provede𝑛-krát. Bloku resp. argumentu se

### předá jako argument číslo iterace (od 1 do𝑛včetně). Návratovou hodnotu udává návratová

### hodnota posledního vykonání bloku z argumentu (nebo nil , pokud se žádný nevykoná).

### TřídaString : Object

### Instance této třídy reprezentují řetězce. Řetězec je uložen v interním instančním atributu. Výchozí

### hodnota (při použití String new ) je prázdný řetězec ''. Použitím řetězcového literálu vzniká in-

### stance třídy String , přičemž není definováno, zda jde pro konkrétní literál vždy o stejnou instanci.

### Třídní metody:

### read Načte řetězec z jednoho řádku vstupu (tj. po odřádkování včetně, které ale není součástí

### načteného řetězce) a vytvoří odpovídající instanci String.

### Instanční metody:

### print Vytiskne řetězec na výstup (bez jakýchkoliv formátovacích znaků), vrací self.

### equalTo: Porovná, zda je řetězec (v interním inst. atributu) příjemce a argumentu shodný (odpo-

### vídá běžnému porovnání shody řetězců v implementačním jazyce interpretu).

### asString Vrací sebe sama.

### asInteger Pokud lze příjemce jednoduše převést na celé číslo, vrací instanci Integer , jinak

### vrací nil.

### concatenateWith: Vrací novou instanci String , která obsahuje konkatenaci příjemce a argu-

### mentu (argument musí být instance třídy String nebo její podtřídy, jinak vrací nil ).

### startsWith:endsBefore: Vrací podřetězec od indexu daného prvním argumentem (indexuje

### se od 1 ) po předchozí znak daným druhým argumentem. Je-li rozdíl argumentů menší či

### roven 0, vrací prázdný řetězec. Nejsou-li argumenty kladná nenulová celá čísla, vrací nil.

### Je-li endsBefore větší než délka řetězce, vrací podřetězec až po konec příjemce.

(^9) https://www.php.net/manual/en/function.intdiv.php
(^10) Např. blok s jedním parametrem.

### length Vrací počet znaků řetězce (jako instanci Integer ). Jedna escape sekvence se počítá jako

### jeden znak.

### TřídaBlock : Object

### Instance této třídy reprezentují bloky kódu. Pokud instance vzniká podle blokového literálu, inter-

### pret zajistí, že tato instance obslouží zprávu s identifikátorem value , která očekává příslušný počet

### parametrů. Bezparametrický blok tak bude obsahovat metodu value , zatímco např. blok se dvěma

### parametry bude obsahovat metodu value:value:. Třídní zpráva new zaslaná třídě Block vytvo-

### ří novou instanci reprezentující prázdný bezparametrický blok (včetně bezparametrické metody

### value ).

### Další instanční metody:

### whileTrue: Jako argument přijímá instanci (tzv. tělo), která rozumí zprávě value (např. bez-

### parametrický blok), který se opakovaně provádí, dokud je příjemce vyhodnocen jako true.

### Návratovou hodnotou je návratová hodnota naposledy provedeného těla, nebo, nebylo-li tělo

### provedeno ani jednou, tak nil.

```
"tělonějaké metody vrámci nějaké třídy, kdese vytvoří atribut'attr'"
x :=self attr: 3.
y := [| ret := (selfattr) greaterThan: 0. ] whileTrue:
[| r := ((selfattr) asString) print.
r :=self attr: ((selfattr) minus: 1).].
```

### TřídyTrue : ObjectaFalse : Object

### Třídy True a False reprezentují logické hodnoty pravdy a nepravdy. Každá z těchto tříd je imple-

### mentována jako jedináček přístupný přes globálně viditelný objekt true a false (obdobně jako

### Nil ).

### Instanční metody:

### asString Pro objekty true a false vrací řetězec 'true' nebo 'false'.

### not Vrací negaci logické hodnoty příjemce.

### and: Je-li příjemce false , vrací false. Je-li příjemce true , vyhodnotí se argument zasláním

### zprávy value (tj. např. bezparametrický blok).

### or: Je-li příjemce true , vrací true. Je-li příjemce false , vyhodnotí se argument zasláním zprá-

### vy value (argument je např. bezparametrický blok).

### ifTrue:ifFalse: Je-li příjemce true , vyhodnotí se první argument zasláním zprávy value.

### Je-li příjemce false , vyhodnotí se druhý argument zasláním zprávy value. Návratovou

### hodnotou je návratová hodnota provedeného bloku.

### isBoolean Vrací true.

### Těmito metodami je tedy podporováno zkrácené vyhodnocování pravdivostních výrazů. Dokud

### argument není vyhodnocen zasláním zprávy, tak nemusí vadit, že dané zprávě nerozumí.

"Příkladvýrazu spravdivostními hodnotami"
y := (true and: [| _ :=false isBoolean. ]) or: [| _ :=nil error].
"vrací true,bloks nilerror nenívůbec vykonán"
\_ := (y asString) print.

## Poznámky k implementaci

## V případě nekompletní implementace se nejprve zaměřte na možnost definice uživatelské třídy

## Main s metodou run a možnost provádět příkazy v bezparametrickém bloku, dále podporujte vý-

## stupní metody a minimalisticky implementované vestavěné třídy Object , String a Integer.

# 3 Přehled chybových návratových kódů

## Jestliže proběhne činnost skriptu bez chyb, vrací se návratová hodnota 0 (nula). Jestliže dojde

## k nějaké chybě, vrací se chybová návratová hodnota podle přehledu níže.

## Pozor: Veškerá chybová hlášení, varování a ladicí výpisy směřujte pouze na standardní chybový

## výstup (stderr), jinak vaše řešení neprojde automatickými testy!

## 10 chybí parametr příkazové řádky, který je povinný, nebo je použita zakázaná kombinace pa-

## rametrů

## 11 chyba při otevírání vstupních souborů (např. neexistence, nedostatečné oprávnění)

## 20 chybný XML formát ve vstupním souboru (soubor není tzv. dobře formátovaný, angl. well-

## -formed , viz [ 1 ])

## 42 neočekávanástrukturaXML(např.špatnézanořeníelementů,špatnáhodnotaatributulan-

## guage, chybějící povinné atributy, špatné hodnoty atributu order , apod.)

## 31 statická sémantická chyba – chybějící třída Main či její instanční metoda run

## 32 statická sémantická chyba – použití nedefinované (a tedy i neinicializované) proměnné, for-

## málního parametru, třídy, nebo třídní metody

## 33 statická sémantická chyba arity – špatná arita bloku přiřazeného k selektoru při definici

## instanční metody

## 34 statická sémantická chyba – pokus o přiřazení do formálního parametru bloku (tj. formální

## parametr na levé straně příkazu přiřazení)

## 35 jiná statická sémantická chyba (např. redefinice třídy, kolizní jména parametrů ve stejném

## bloku a podobně)

## 51 běhová chyba interpretace – příjemce nerozumí zaslané zprávě (a nejde o vytváření instanč-

## ního atributu)

## 52 běhová chyba interpretace – ostatní chyby

## 53 běhová chyba interpretace – špatná hodnota argumentu (např. dělení nulou, nekompatibilní

## argument pro třídní zprávu from: )

## 54 běhová chyba interpretace – pokus o vytvoření instančního atributu, jehož název by kolido-

## val s metodou

## 99 neočekávaná interní chyba (neovlivněná integrací, vstupními soubory či parametry příka-

## zové řádky)

## Chyby 31–35 jsou označeny jako „statické“, neboť je lze detekovat prostou statickou analýzou

## vstupního programu bez jeho provádění. Chyby 51–54 jsou označeny jako „běhové“, neboť je není

## možné spolehlivě detekovat bez provádění kódu. Vaše interpretace nemusí (ale může) provádět

## statickou analýzu – i statické chyby mohou být detekovány až při běhu, tudíž pouze v případech,

## kdy se na ně při konkrétním spuštění narazí.

# 4 Popis XML reprezentace programu

## Za povinnou XML hlavičkou^11 následuje kořenový element program s povinným textovým atri-

## butemlanguages hodnotou "SOL26" a případně nepovinným textovým atributemdescrip-

## tions krátkým popisem programu.

## Elementprogramobsahuje pro uživatelsky definované třídy podelementy class. Každý element

## classobsahuje dva povinné atributy:

## • names identifikátorem třídy,

## • parents identifikátorem nadtřídy (rodiče).

## Elementclasspak obsahuje podelement method pro každou definovanou instanční metodu,

## a to s povinným atributemselectorpro určení selektoru definované metody. Elementmethod

## potom obsahuje element pro blok s odpovídajícím počtem argumentů.

## U příkazů v bloku, parametrů a argumentů je důležité pořadí. Protože XML nezajišťuje u elementů

## na stejné úrovni pořadí, je nutné u těchto elementů pořadí explicitně zapsat použitím povinného

## textového atributuorder, který je vždy číslován souvisle a od jedničky (viz příklad níže).

## Blok je reprezentován elementem block s povinným atributemarityudávajícím počet očekáva-

## ných argumentů pro budoucí vyhodnocení bloku. Elementblockobsahuje podelementy para-

## meter pro každý parametr bloku se dvěma povinným atributyorderanamepro pořadí a identi-

## fikátor parametru. Dále elementblockobsahuje podelementy pro každý příkaz sekvence příkazů.

## Příkaz je reprezentován elementem assign s povinným atributemorderpro určení pořadí pří-

## kazu v sekvenci příkazů. Příkaz zahrnuje dva povinné podelementy var s atributemnamepro

## identifikátor cílové proměnné a podelementexprpro výraz pro výpočet přiřazované hodnoty.

## Výraz (element expr ) obsahuje jeden podelement podle druhu výrazu:

## • literál (literal, viz dále),

## • proměnná (var, viz výše),

## • blokový literál (block, viz výše) nebo

## • zaslání zprávy (send, viz dále).

## Element literal obsahuje dva povinné textové atributyclasss identifikátorem vestavěné třídy

## ( Integer / String / Nil / True / False ) a atributvaluereprezentující hodnotu literálu (primitivní),

## např. číslo -10, prázdný řetězec, či true.

## U literálů typu String jsou v XML převedeny původní escape sekvence na odpovídající XML

## entity (např.\nna&#10;). XML entity jsou využity také pro znaky, které v XML nelze jinak

## zapsat (<,>, &,',"jsou převedeny na&lt;,&gt;,&amp;,&apos;,&quot;).

## Pro vyjádření literálu identifikátoru třídy je atributclassnastaven na "class" avalueobsahuje

## identifikátor třídy. Literál bloku je reprezentován elementemblock(viz výše).

## Zaslání zprávy je reprezentováno elementem send , jehož selektor zprávy je uložen v povinném

## textovém atributuselector. Výraz pro vyhodnocení příjemce zprávy je v podelementuexpr

## (viz výše). Pokud se jedná o zprávu s parametry, obsahuje elementsendještě podelement arg pro

## každý argument předávaný zprávě. Elementargmá povinný argumentordera obsahuje právě

## jeden podelementexpr(viz výše) pro výraz, jehož vyhodnocením získáme skutečný argument

## zprávy.

(^11) Tradiční XML hlavička včetně verze a kódování je<?xml version="1.0" encoding="UTF-8" ?>

## Příklad úryvku jazyka SOL26:

[ :one :two | r := **Integer from** : two. ]

## a jemu odpovídající XML:

**<block** arity=" 2 " **>
<parameter** name="one"order=" 1 " **/>
<parameter** name="two"order=" 2 " **></parameter>
<assign** order=" 1 " **>
<var** name="r" **/>
<expr>
<send** selector="from:" **>
<expr><literal** class="class" value="Integer" **/></expr>
<arg** order=" 1 " **>
<expr><var** name="two" **/></expr>
</arg>
</send>
</expr>
</assign>
</block>**

# Reference

## [1] Extensible Markup Language (XML) 1.0. W3C. World Wide Web Consortium [online]. 5.

## vydání. 26. 11. 2008 [cit. 2020-02-03]. Dostupné z:https://www.w3.org/TR/xml/

# Revize specifikace

## 2026-02-26: Oprava špatné závorky v příkladu na str. 4.
