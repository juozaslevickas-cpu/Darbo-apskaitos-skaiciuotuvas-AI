# Darbo laiko apskaitos taisyklės (Lietuva, LR Darbo kodeksas)

> Šis dokumentas yra vienintelis tiesos šaltinis (single source of truth) skaičiuotuvo logikai.
> Visos taisyklės paremtos LR Darbo kodeksu (DK), galiojančia redakcija.
> Jei kyla abejonė – vadovautis DK straipsniu, nurodytu prie kiekvienos taisyklės.

---

## 1. PAGRINDINĖS SĄVOKOS

### 1.1 Darbo laikas (DK 111 str.)
Darbo laikas – bet koks laikas, kuriuo darbuotojas yra darbdavio žinioje ar atlieka pareigas pagal darbo sutartį.

Į darbo laiką **įtraukiami** šie laikotarpiai:
- Pasirengimas darbui darbo vietoje
- Fiziologinės pertraukos ir specialios pertraukos
- Kelionės iš darbovietės į darbdavio nurodytą darbo funkcijos laikino atlikimo vietą laikas
- Budėjimo laikas (DK 118 str.)
- Kvalifikacijos tobulinimo darbdavio pavedimu laikas
- Privalomų sveikatos patikrinimų laikas
- Prastovos laikas
- Nušalinimo nuo darbo laikas (jei darbuotojas privalo likti darbovietėje)
- Kiti darbo teisės normų nustatyti laikotarpiai

### 1.2 Darbo laiko norma (DK 112 str.)
Darbo laiko norma – laiko trukmė, kurią darbuotojas vidutiniškai per tam tikrą laikotarpį turi dirbti darbdaviui pagal darbo sutartį.

```
STANDARTINĖ NORMA = 40 valandų per savaitę
```

**Sutrumpinta norma** gali būti nustatyta:
- DK 112 str. 4 d.: kai darbas susijęs su didesne protine, emocine įtampa, pavojais
- DK 112 str. 5 d.: viešojo sektoriaus darbuotojai, auginantys vaikus iki 3 m. → **32 val./sav.**

**Prieššventinės dienos sutrumpinimas** (DK 112 str. 6 d.):
```
Švenčių dienų išvakarėse darbo dienos trukmė SUTRUMPINAMA 1 VALANDA,
išskyrus darbuotojus, dirbančius pagal sutrumpintą darbo laiko normą.
```

### 1.3 Darbo laiko režimai (DK 113 str.)
Šis skaičiuotuvas skirtas **2-ajam režimui – SUMINEI DARBO LAIKO APSKAITAI**.

Galimi režimai:
1. Nekintanti dienos trukmė ir dienų skaičius per savaitę
2. **Suminė darbo laiko apskaita** ← ŠIAM PROJEKTUI
3. Lankstus darbo grafikas
4. Suskaidytos darbo dienos režimas
5. Individualus darbo laiko režimas

**Jei režimas nenustatytas** → preziumuojama: 5 darbo dienos per savaitę, kiekvienos savaitės darbo dienomis valandų skaičius yra vienodas (DK 113 str. 3 d.).

---

## 2. SUMINĖ DARBO LAIKO APSKAITA (DK 115 str.)

### 2.1 Esmė
Suminė darbo laiko apskaita – darbo laiko režimas, kai viso **apskaitinio laikotarpio** darbo laiko norma įvykdoma per apskaitinį laikotarpį (ne kiekvieną savaitę atskirai).

### 2.2 Apskaitinis laikotarpis
```
APSKAITINIS_LAIKOTARPIS = nustatomas organizacijos vidaus dokumentuose
Tipiniai variantai: 1 mėnuo | 2 mėnesiai | 3 mėnesiai | iki 12 mėnesių
```
> SVARBU: Skaičiuotuvas turi leisti vartotojui pasirinkti/konfigūruoti apskaitinį laikotarpį.

### 2.3 Darbo grafikai
- Darbuotojas dirba pagal **iš anksto sudarytą darbo (pamainų) grafiką**
- Grafikai pranešami darbuotojams **ne vėliau kaip prieš 7 kalendorines dienas** iki įsigaliojimo
- Keisti galima **tik nuo darbdavio valios nepriklausančiais atvejais**, įspėjus darbuotoją **prieš 2 darbo dienas**
- **DRAUDŽIAMA** skirti darbuotoją dirbti **dvi pamainas iš eilės**
- Grafikai turi kiek įmanoma **tolygiau paskirstyti** darbo laiką per apskaitinį laikotarpį

### 2.4 Mėnesio darbo laiko normos skaičiavimas

```python
def menesio_norma(metai, menuo, savaitine_norma=40, etatas=1.0):
    """
    Skaičiuoja mėnesio darbo laiko normą valandomis.

    Formulė:
    NORMA = (darbo_dienu_sk × dienos_norma - priessventiniu_sutrumpinimai) × etatas

    Kur:
    - darbo_dienu_sk = darbo dienų skaičius mėnesyje (be švenčių dienų, sutampančių su darbo dienomis)
    - dienos_norma = savaitine_norma / 5  (jei 5 darbo dienos per savaitę)
    - priessventiniu_sutrumpinimai = švenčių dienų, sutampančių su darbo dienomis,
      išvakarių skaičius × 1 valanda (tik pilno etato darbuotojams)
    """
```

**KRITINĖ TAISYKLĖ:**
- Švenčių dienos, sutampančios su darbo dienomis (pirmadieniu–penktadieniu), **mažina mėnesio darbo laiko normą**
- Prieššventinė diena (diena prieš šventę) sutrumpinama 1 val., BET tik jei ta diena yra darbo diena IR darbuotojas dirba ne sutrumpintą normą

### 2.5 Atsiskaitymas laikotarpio pabaigoje (DK 115 str. 5-7 d.)

```
JEI faktiškai_dirbta < mėnesio_norma IR tai ne darbuotojo kaltė:
    → Darbdavys PRIVALO sumokėti už neįvykdytą normą

JEI faktiškai_dirbta > mėnesio_norma:
    → Viršytas laikas = viršvalandžiai
    → Apmokama ×1.5 darbo užmokesčio dydžio
    → ARBA darbuotojo prašymu: viršytas laikas × 1.5 → pridedama prie kasmetinių atostogų

Dirbant suminę apskaitą, DU mokamas už FAKTIŠKAI IŠDIRBTĄ LAIKĄ.
Darbdavys GALI mokėti pastovų mėnesinį DU, o galutinį atsiskaitymą atlikti
paskutinį apskaitinio laikotarpio mėnesį.
```

---

## 3. MAKSIMALAUS DARBO LAIKO RIBOS (DK 114 str.)

### 3.1 Ribų lentelė

| Riba | Reikšmė | DK straipsnis | Pastaba |
|------|---------|---------------|---------|
| Max vidutinis darbo laikas per 7 dienas | **48 val.** | DK 114 str. 1 d. | Su viršvalandžiais, bet BE papildomo darbo |
| Max darbo laikas per dieną (pamainą) | **12 val.** | DK 114 str. 2 d. | Neskaičiuojant pietų pertraukos |
| Max darbo laikas per 7 dienas (su papildomu darbu) | **60 val.** | DK 114 str. 2 d. | Su viršvalandžiais IR papildomu darbu |
| Max darbo dienų iš eilės | **6 dienos** | DK 114 str. 4 d. | Per 7 paeiliui einančias dienas |
| Draudimas dirbti 2 pamainas iš eilės | **TAIP** | DK 115 str. 4 d. | Griežtas draudimas |

### 3.2 Validacijos taisyklės (ALERTS)

Skaičiuotuvas **PRIVALO** tikrinti ir signalizuoti apie šiuos pažeidimus:

```
ALERT_1: pamaina_trukme > 12 valandų (be pietų pertraukos)
ALERT_2: vidurkis_per_7_dienas > 48 valandų
ALERT_3: darbo_laikas_su_papildomu_per_7_dienas > 60 valandų
ALERT_4: darbo_dienos_is_eiles > 6
ALERT_5: dvi_pamainos_is_eiles == True
ALERT_6: poilsis_tarp_pamainu < 11 valandų
ALERT_7: savaitinis_poilsis < 35 valandų (nepertraukiamas)
ALERT_8: nakties_darbo_vidurkis > 8 val./dieną per 3 mėn.
```

---

## 4. MINIMALIOJO POILSIO LAIKO REIKALAVIMAI (DK 122 str.)

### 4.1 Ribų lentelė

| Poilsio tipas | Minimali trukmė | DK straipsnis | Pastaba |
|---------------|-----------------|---------------|---------|
| Pietų pertrauka | **≥ 30 min, ≤ 2 val.** | DK 122 str. 2 d. 2 p. | Ne vėliau kaip po 5 val. darbo |
| Kasdieninis poilsis tarp pamainų | **≥ 11 val.** nepertraukiamai | DK 122 str. 2 d. 3 p. | Jei darbo diena >12 val. → ≥ 24 val. |
| Savaitinis nepertraukiamas poilsis | **≥ 35 val.** per 7 dienų laikotarpį | DK 122 str. 2 d. 3 p. | — |
| Poilsis po 24 val. budėjimo | **≥ 24 val.** | DK 122 str. 2 d. 4 p. | — |

---

## 5. NAKTIES DARBAS (DK 117 str.)

### 5.1 Apibrėžimas
```
NAKTIES_LAIKAS = nuo 22:00 iki 06:00
```

### 5.2 Kas laikomas dirbančiu naktį
Darbuotojas laikomas dirbančiu naktį, jei:
- Per darbo dieną (pamainą) **dirba ≥ 3 valandas** nakties laiku, **ARBA**
- Per metus **dirba ≥ 1/4 (25%)** viso darbo laiko nakties laiku

### 5.3 Nakties darbo ribos
```
Naktinio darbo laikas vidutiniškai ≤ 8 val./dieną per 3 mėn. apskaitinį laikotarpį
(jei aukštesniu nei darbdavio lygmeniu kolektyvinėse sutartyse nesusitarta kitaip)
```

### 5.4 Nakties valandų skaičiavimas

```python
def nakties_valandos(pamaina_pradzia, pamaina_pabaiga):
    """
    Skaičiuoja kiek valandų iš pamainos patenka į nakties laiką (22:00-06:00).

    Pavyzdžiai:
    - Pamaina 06:00-18:00 → 0 nakties valandų
    - Pamaina 18:00-06:00 → 8 nakties valandų (22:00-06:00)
    - Pamaina 20:00-08:00 → 8 nakties valandų (22:00-06:00)
    - Pamaina 22:00-06:00 → 8 nakties valandų
    - Pamaina 14:00-22:00 → 0 nakties valandų (22:00 jau ne darbo laikas)
    - Pamaina 14:00-23:00 → 1 nakties valanda (22:00-23:00)

    SVARBU: Jei pamaina kerta vidurnaktį, ji apima dvi kalendorines dienas.
    Nakties valandos = persidengimo su intervalu [22:00, 06:00+24h] trukmė.
    """
```

---

## 6. VIRŠVALANDŽIAI (DK 119 str.)

### 6.1 Apibrėžimas
Viršvalandžiai – laikas, kai darbuotojas faktiškai dirba **viršydamas** jam nustatytą darbo laiko režimą arba apskaitinio laikotarpio bendrą darbo laiko trukmę.

### 6.2 Suminės apskaitos kontekstas
```
Viršvalandžiai identifikuojami APSKAITINIO LAIKOTARPIO PABAIGOJE:
virsvalandziai = faktiskai_dirbta - menesio_norma  (jei > 0)

Taip pat viršvalandžiais laikomas darbas viršijant 12 val. per dieną.
```

### 6.3 Viršvalandžių ribos
```
MAX viršvalandžių per 7 dienų laikotarpį = 8 valandos
  (SU darbuotojo rašytiniu sutikimu = iki 12 valandų)

MAX viršvalandžių per metus = 180 valandų
  (kolektyvinė sutartis gali nustatyti daugiau)
```

---

## 7. ŠVENČIŲ DIENOS (DK 123 str.)

### 7.1 Švenčių dienų sąrašas

```python
SVENCIU_DIENOS = {
    "static": [
        (1, 1),    # Naujųjų metų diena
        (2, 16),   # Lietuvos valstybės atkūrimo diena
        (3, 11),   # Lietuvos nepriklausomybės atkūrimo diena
        (5, 1),    # Tarptautinė darbo diena
        (6, 24),   # Rasos ir Joninių diena
        (7, 6),    # Valstybės (Mindaugo karūnavimo) diena
        (8, 15),   # Žolinė (Švč. Mergelės Marijos ėmimo į dangų diena)
        (11, 1),   # Visų Šventųjų diena
        (11, 2),   # Mirusiųjų atminimo (Vėlinių) diena
        (12, 24),  # Kūčių diena
        (12, 25),  # Kalėdų diena (pirma)
        (12, 26),  # Kalėdų diena (antra)
    ],
    "dynamic": [
        "Velykos_sekmadienis",     # Krikščionių Velykos (sekmadienis) - kintama data
        "Velykos_pirmadienis",     # Velykų antra diena (pirmadienis) - kintama data
        "Motinos_diena",           # Pirmas gegužės sekmadienis
        "Tevo_diena",              # Pirmas birželio sekmadienis
    ]
}
```

> **SVARBU**: Velykų data kinta kasmet. Skaičiuotuvas PRIVALO turėti Velykų datos apskaičiavimo funkciją arba iš anksto suvestas datas.
> Motinos diena = pirmas gegužės sekmadienis.
> Tėvo diena = pirmas birželio sekmadienis.

### 7.2 Švenčių dienų poveikis skaičiavimui

```
1. Švenčių diena, sutampanti su darbo diena (Pr-Pn) → MAŽINA mėnesio normą
2. Prieššventinė darbo diena → sutrumpinama 1 valanda (tik pilnam etatui)
3. Darbas švenčių dieną pagal suminę apskaitą → LEIDŽIAMAS (DK 123 str. 2 d.)
4. Žymimas kodu: S (švenčių diena), DP (darbas poilsio ir švenčių dienomis)
```

---

## 8. POILSIO DIENOS (DK 124 str.)

```
Bendra poilsio diena = SEKMADIENIS
Poilsio dieną dirbti galima su darbuotojo sutikimu.
IŠIMTIS: suminė darbo laiko apskaita → galima dirbti poilsio dieną pagal grafiką.

Žymėjimas: P (poilsio diena)
```

---

## 9. DARBO LAIKO APSKAITA (DK 120 str.)

### 9.1 Ką privalo apskaityti darbdavys
Darbdavys privalo tvarkyti darbuotojų darbo laiko apskaitą:

Privaloma apskaityti:
1. **Viršvalandžius**
2. **Darbo laiką švenčių dieną**
3. **Darbo laiką poilsio dieną** (jei nenustatytas pagal grafiką)
4. **Darbo laiką naktį**
5. **Darbo laiką pagal susitarimą dėl papildomo darbo**

### 9.2 Apskaitos forma
Darbo laiko apskaita tvarkoma darbdavio patvirtintos formos darbo laiko apskaitos žiniaraščiuose (gali būti elektroniniai).

---

## 10. SUTARTINIAI ŽYMĖJIMAI (iš žiniaraščio pildymo tvarkos aprašo)

### 10.1 Pagrindiniai kodai

| Kodas | Reikšmė | DK straipsnis |
|-------|---------|---------------|
| DN | Darbas naktį | DK 117 str. |
| VD | Viršvalandinis darbas | DK 119 str. |
| DP | Darbas poilsio ir švenčių dienomis | DK 123 str. 2d., 124 str. 2d. |
| PD | Papildomo darbo laikas | DK 35 str. 4 d. |
| BN | Pasyvus budėjimas (namuose) | DK 118 str. 2 d. |
| BĮ | Aktyvus budėjimas darbe (darbovietėje) | DK 118 str. 1 d. |
| V | Papildomas poilsio laikas (už viršvalandžius/poilsio/švenčių d.) | DK 107 str. 4 d. |
| P | Poilsio dienos | DK 124 str. 1 d. |
| S | Švenčių dienos | DK 123 str. 1 d. |

### 10.2 Neatvykimo kodai

| Kodas | Reikšmė | DK straipsnis |
|-------|---------|---------------|
| A | Kasmetinės atostogos | DK 126 str. 1 d. |
| MA | Mokymosi atostogos | DK 135 str. |
| NA | Nemokamos atostogos | DK 137 str. 1 d. |
| KA | Kūrybinės atostogos | DK 136 str. |
| G | Nėštumo ir gimdymo atostogos | DK 132 str. |
| PV | Atostogos vaikui prižiūrėti (iki 3 m.) | DK 134 str. |
| TA | Tėvystės atostogos | DK 133 str. |
| L | Nedarbingumas dėl ligos ar traumų | DK 111 str. 2 d. 9 p. |
| N | Neapmokamas nedarbingumas | DK 111 str. 2 d. 9 p. |
| NS | Nedarbingumas ligoniams slaugyti | DK 111 str. 2 d. 9 p. |
| K | Tarnybinės komandiruotės | DK 107 str. 1 d. |
| KV | Kvalifikacijos kėlimas | DK 111 str. 2 d. 5 p. |
| D | Kraujo davimo dienos donorams | DK 111 str. 2 d. 9 p. |
| M | Papildomas poilsis (neįgalus vaikas iki 18 m. / 2+ vaikai iki 12 m.) | DK 138 str. 3 d. |
| MD | Privalomų medicininių apžiūrų laikas | DK 111 str. 2 d. 6 p. |
| ID | Laikas naujo darbo paieškoms | DK 64 str. 6 d. |
| PB | Pravaikštos (neatvykimas be svarbios priežasties) | DK 111 str. 2 d. 8 p. |
| ND | Neatvykimas dėl šeimyninių aplinkybių | DK 137 str. 3 d. |
| NP | Neatvykimas kitais norminių teisės aktų nustatytais laikotarpiais | DK 111 str. 2 d. 9 p. |
| NN | Nušalinimas nuo darbo | DK 49 str. 3 d. |
| ST | Streikas | DK 244 str. |
| SŽ | Stažuotės | DK 111 str. 2 d. 9 p. |
| PR | Valstybinių/visuomeninių/piliečio pareigų vykdymas | DK 137 str. 4 d. |
| KT | Karinė tarnyba | DK 111 str. 2 d. 9 p. |
| KM | Mokomosios karinės pratybos | DK 111 str. 2 d. 9 p. |

---

## 11. ŽINIARAŠČIO STRUKTŪRA (4 eilutės kiekvienam darbuotojui)

```
Eilutė 1: Faktiškai dirbtas laikas (valandomis) IR neatvykimo kodai
          Kasmetinės atostogos (A) žymimos TIK darbo dienomis

Eilutė 2: (tuščia – rezervuota)

Eilutė 3: Nukrypimai nuo normalių darbo sąlygų:
          - Viršvalandžiai (VD)
          - Darbas poilsio dienomis (DP)
          - Darbas švenčių dienomis (DP)
          - Pavadavimo valandos
          - Nakties darbo valandos (DN)
          - Faktinės namų mokymo/konsultacijų valandos

Eilutė 4: Neatvykimo atvejai, prilyginti darbo laikui (DK 111 str.):
          - Kvalifikacijos kėlimas (KV)
          - Komandiruotės (K)
          - Medicininės apžiūros (MD)
          - ir kt.
```

---

## 12. MĖNESIO BALANSO SKAIČIAVIMAS

### 12.1 Formulės

```python
# Mėnesio darbo laiko norma
menesio_norma = darbo_dienu_sk * (savaitine_norma / 5) - priessventiniu_sutrumpinimai

# Jei etatas ne pilnas:
menesio_norma_darbuotojui = menesio_norma * etato_dydis

# Faktiškai dirbtų valandų suma
faktiskai_dirbta = sum(kiekvienos_darbo_dienos_valandos)

# Skirtumas
skirtumas = faktiskai_dirbta - menesio_norma_darbuotojui

# Jei skirtumas > 0 → viršvalandžiai (apskaitinio laikotarpio pabaigoje)
# Jei skirtumas < 0 → neišdirbta norma (ne darbuotojo kaltė → mokėti vis tiek)
# Jei skirtumas == 0 → norma įvykdyta tiksliai
```

### 12.2 Neatvykimų balansas
```
Neatvykimų balansinėse grafose nurodomas TIK NEDIRBTAS DARBO LAIKAS
pagal darbuotojo darbo grafiką.

Tai reiškia: jei darbuotojas sirgo poilsio dieną pagal jo grafiką,
ši diena NEĮTRAUKIAMA į neatvykimų balansą.
```

---

## 13. APMOKĖJIMO KOEFICIENTAI (DK 144 str.)

> PASTABA: Šis skaičiuotuvas skirtas TIK darbo laiko apskaitai.
> Žemiau pateikiami koeficientai tik informaciniais tikslais / būsimam plėtimui.

| Aplinkybė | Koeficientas | DK straipsnis |
|-----------|-------------|---------------|
| Darbas poilsio dieną (ne pagal grafiką) | **× 2.0** DU | DK 144 str. 1 d. |
| Darbas švenčių dieną | **× 2.0** DU | DK 144 str. 2 d. |
| Darbas naktį | **× 1.5** DU dydžio | DK 144 str. 3 d. |
| Viršvalandinis darbas | **× 1.5** DU dydžio | DK 144 str. 4 d. |
| Viršvalandinis + poilsio diena (ne pagal grafiką) | **× 2.0** DU | DK 144 str. 4 d. |
| Viršvalandinis + naktis | **× 2.0** DU | DK 144 str. 4 d. |
| Viršvalandinis + švenčių diena | **× 2.5** DU | DK 144 str. 4 d. |
| Viršvalandinis + švenčių naktis | **× 2.5** DU | DK 144 str. 4 d. |

---

## 14. KASMETINIŲ ATOSTOGŲ ŽYMĖJIMAS (DK 126, 130 str.)

```
- Atostogos skaičiuojamos DARBO DIENOMIS (ne kalendorinėmis)
- Švenčių dienos į atostogų trukmę NEĮSKAIČIUOJAMOS (DK 126 str. 4 d.)
- Standartinė trukmė: 20 darbo dienų (5 d.d./sav.) arba 24 darbo dienos (6 d.d./sav.)
- Žiniaraštyje kasmetinės atostogos (A) žymimos TIK darbo dienomis (DK 130 str.)
```

---

## 15. SKAIČIUOTUVO VALIDACIJOS CHECKLIST

Prieš pateikiant rezultatus, skaičiuotuvas turi patikrinti:

- [ ] Ar pamaina neviršija 12 val. (be pietų)?
- [ ] Ar tarp pamainų yra ≥11 val. poilsio?
- [ ] Ar per 7 dienų laikotarpį yra ≥35 val. nepertraukiamas poilsis?
- [ ] Ar darbuotojas nedirba >6 dienų iš eilės?
- [ ] Ar darbuotojas neskirtas dirbti 2 pamainas iš eilės?
- [ ] Ar vidutinis darbo laikas per 7 dienas ≤48 val.?
- [ ] Ar nakties darbo vidurkis ≤8 val./dieną per 3 mėn.?
- [ ] Ar viršvalandžiai per 7 dienas ≤8 val. (arba ≤12 val. su sutikimu)?
- [ ] Ar viršvalandžiai per metus ≤180 val.?
- [ ] Ar prieššventinė diena sutrumpinta 1 val.?
- [ ] Ar švenčių dienos teisingai atimtos iš mėnesio normos?
- [ ] Ar kasmetinės atostogos žymimos tik darbo dienomis?
- [ ] Ar neatvykimai skaičiuojami tik pagal darbuotojo grafiką (ne kalendorines dienas)?
