# Darbo Laiko Apskaitos Skaičiuotuvas – Cursor Rules

## Projekto kontekstas
Tai yra Lietuvos Respublikos darbo laiko apskaitos skaičiuotuvas, skirtas darbuotojams,
dirbantiems pagal **suminę darbo laiko apskaitą** (slenkantį grafiką).
Visos skaičiavimo taisyklės paremtos LR Darbo kodeksu.

## Taisyklių šaltinis
VISADA renkis į failą `DARBO_LAIKO_TAISYKLES.md` – tai vienintelis tiesos šaltinis
(single source of truth) visai skaičiavimo logikai. Jei abejoji – žiūrėk taisykles,
o ne spėk.

## Pagrindiniai principai

### 1. Juridinis tikslumas
- Standartinė darbo laiko norma: **40 val./savaitę**
- Nakties laikas: **22:00–06:00**
- Švenčių dienos pagal DK 123 str. (14 švenčių dienų, kai kurios kintamos – Velykos)
- Prieššventinė diena sutrumpinama **1 valanda** (tik pilnam etatui)
- Poilsis tarp pamainų: **≥ 11 val.**
- Savaitinis nepertraukiamas poilsis: **≥ 35 val.**
- Max pamaina: **12 val.** (be pietų pertraukos)
- Max vidutinis darbo laikas per 7 dienas: **48 val.**
- Max darbo dienos iš eilės: **6**
- Draudžiama: 2 pamainos iš eilės

### 2. Skaičiavimo logika
- Mėnesio norma = darbo_dienų_sk × (savaitinė_norma / 5) - prieššventinių_sutrumpinimai
- Norma koreguojama pagal etato dydį
- Viršvalandžiai identifikuojami APSKAITINIO LAIKOTARPIO PABAIGOJE
- Neatvykimai skaičiuojami TIK pagal darbuotojo individualų grafiką, NE pagal standartinį kalendorių

### 3. Techniniai reikalavimai
- Laiko skaičiavimai – naudoti 24 val. formatą (00:00–23:59)
- Pamaina gali kirsti vidurnaktį (pvz., 22:00–06:00) – tai normalu
- Nakties valandų skaičiavimas: apskaičiuoti persidengimą su intervalu [22:00, 06:00]
- Visi laiko duomenys saugomi kaip datos ir laikai (ne tik valandos)
- Float aritmetika: naudoti `Decimal` arba apvalinti iki 0.01 val. (arba minučių)

### 4. Validacijos
Kiekvienas grafiko įrašas turi būti tikrinamas prieš visas ribas iš
`DARBO_LAIKO_TAISYKLES.md` 15 skyriaus. Pažeidimai turi generuoti
aiškius pranešimus su nuoroda į DK straipsnį.

### 5. Duomenų struktūra

#### Darbuotojas
```
{
  id: string,
  vardas: string,
  pavarde: string,
  pareigos: string,
  etatas: number (0.25–1.0),
  savaitine_norma: number (default: 40),
  darbo_sutarties_pradzia: date,
  suminė_apskaita: boolean (default: true),
  apskaitinis_laikotarpis_menesiai: number (1–12)
}
```

#### Darbo diena (grafiko įrašas)
```
{
  darbuotojo_id: string,
  data: date,
  tipas: enum [
    "DARBAS",           // Eilinė darbo diena pagal grafiką
    "POILSIS",          // Poilsio diena pagal grafiką (P)
    "SVENTE",           // Švenčių diena (S)
    "ATOSTOGOS",        // Kasmetinės atostogos (A)
    "LIGA",             // Nedarbingumas (L)
    "KOMANDIRUOTE",     // Komandiruotė (K)
    "NEATVYKIMAS",      // Kitas neatvykimas
    ... (visi kodai iš DARBO_LAIKO_TAISYKLES.md 10 skyriaus)
  ],
  pamaina_pradzia: time | null,    // null jei ne DARBAS
  pamaina_pabaiga: time | null,    // null jei ne DARBAS
  pietu_pertrauka_min: number,     // minutėmis (default: 60)
  neatvykimo_kodas: string | null, // sutartinis žymėjimas (A, L, K, NA, ...)
  pastaba: string | null
}
```

#### Apskaičiuoti laukai (computed)
```
{
  dirbtos_valandos: number,           // pamaina_pabaiga - pamaina_pradzia - pietu_pertrauka
  nakties_valandos: number,           // persidengimas su 22:00-06:00
  ar_sventes_diena: boolean,          // pagal DK 123 str. sąrašą
  ar_poilsio_diena: boolean,          // ar sekmadienis arba poilsio pagal grafiką
  ar_priessvente: boolean,            // ar prieššventinė diena (sutrumpinta 1 val.)
  poilsis_nuo_ankstesnes_pamainos: number  // valandos tarp šios ir ankstesnės pamainos pabaigos
}
```

### 6. Kalba ir lokalizacija
- UI kalba: **lietuvių**
- Datos formatas: **YYYY-MM-DD**
- Laiko formatas: **HH:MM** (24 val.)
- Skaičių formatas: kablelis kaip dešimtainis skirtukas (pvz., 7,5 val.)
- Savaitė prasideda PIRMADIENĮ

### 7. Ko NEDARYTI
- NIEKADA nekoduok švenčių dienų sąrašo tiesiogiai kode – imk iš konfigūracijos
- NIEKADA nedaryk prielaidos, kad darbo savaitė yra Pr-Pn – suminėje apskaitoje darbo dienos priklauso nuo grafiko
- NIEKADA neskaičiuok atostogų kalendorinėmis dienomis – TIK darbo dienomis
- NIEKADA neapvalint nakties valandų į sveikus skaičius – saugok tikslias reikšmes
- NIEKADA neignoruok pamainų, kertančių vidurnaktį – tai standartinis atvejis slenkančiame grafike

### 8. Failų struktūra (rekomenduojama)
```
/src
  /config
    holidays.ts          # Švenčių dienų sąrašas ir Velykų skaičiavimas
    work-codes.ts        # Sutartiniai žymėjimai (DN, VD, DP, A, L, ...)
    constants.ts         # DK ribos (48h/7d, 12h/dieną, 11h poilsis, ...)
  /models
    employee.ts          # Darbuotojo modelis
    schedule-entry.ts    # Grafiko įrašo modelis
    timesheet.ts         # Žiniaraščio modelis
  /services
    norm-calculator.ts   # Mėnesio normos skaičiavimas
    night-calculator.ts  # Nakties valandų skaičiavimas
    overtime-calculator.ts # Viršvalandžių skaičiavimas
    validation.ts        # DK ribų tikrinimas (alerts)
    balance.ts           # Mėnesio/laikotarpio balanso skaičiavimas
  /utils
    date-utils.ts        # Datos operacijos, švenčių tikrinimas
    time-overlap.ts      # Laiko intervalų persidengimo skaičiavimas
```

### 9. Testavimas
- Kiekviena skaičiavimo funkcija PRIVALO turėti unit testus
- Testai turi apimti edge case'us:
  - Pamaina kertanti vidurnaktį (22:00–06:00)
  - Šventė sutampanti su sekmadieniu
  - Prieššventinė diena, kai darbuotojas dirba sutrumpintą normą
  - Mėnuo su 28/29/30/31 diena
  - Pilnas etatas vs dalinis etatas
  - Vasario mėnuo keliamaisiais metais
  - Darbuotojas dirba tik naktines pamainas
