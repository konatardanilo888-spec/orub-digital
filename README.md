# ORUB DIGITAL — sajt + admin panel

Sajt za digitalnu agenciju ORUB DIGITAL, sa javnim dijelom (crnogorski/srpski + engleski, crno-bijeli dizajn) i admin panelom preko kojeg se **cijeli sadržaj uređuje bez pisanja koda**.

Aplikacija je napravljena isključivo u **čistom Node.js-u** (bez Express-a, EJS-a ili drugih spoljašnjih paketa) — koristi ugrađenu `node:sqlite` bazu koja dolazi sa Node.js 22+. To znači da za pokretanje nije potrebna internet konekcija niti `npm install` bilo čega spoljašnjeg.

---

## 1. Pokretanje na svom računaru (lokalno testiranje)

Potreban je **Node.js verzija 22.5 ili novija** (provjerite sa `node -v`).

```bash
cd orub-digital
npm start
```

Sajt će biti dostupan na: `http://localhost:3000`
Admin panel: `http://localhost:3000/admin`

Baza podataka (`data/orub.sqlite`) se automatski kreira pri prvom pokretanju i puni početnim (demo) sadržajem, kao i jednim admin nalogom. Podaci za prijavu ispisuju se u konzoli pri prvom pokretanju:

```
Email:    admin@orubdigital.com
Lozinka:  OrubDigital2026!
```

**⚠️ Odmah nakon prve prijave promijenite lozinku** — u admin panelu idite na "Promjena lozinke".

Da zaustavite server, pritisnite `Ctrl+C` u terminalu.

---

## 2. Kako izgleda struktura projekta

```
orub-digital/
├── server.js              # glavni fajl — pokreće server i rute
├── package.json
├── lib/                   # baza, sesije, upload slika, pomoćne funkcije
├── views/                 # HTML šabloni (javni sajt + admin panel)
├── public/                # CSS, JS, otpremljene slike (javno dostupno)
└── data/
    └── orub.sqlite        # baza podataka (kreira se automatski)
```

Sav sadržaj sajta (usluge, portfolio, paketi, utisci, FAQ, podešavanja, upiti) čuva se u `data/orub.sqlite`. **Redovno pravite rezervnu kopiju (backup) ovog fajla** — on sadrži sav vaš sadržaj.

---

## 3. Postavljanje na pravi hosting (produkcija)

Aplikacija je obična Node.js aplikacija koja sluša na portu iz `PORT` promjenljive okruženja (podrazumevano 3000). Može se postaviti na bilo koji hosting koji podržava Node.js:

### Opcija A — VPS (sopstveni server, npr. DigitalOcean, Hetzner, itd.)

1. Instalirajte Node.js 22+ na server.
2. Prekopirajte folder `orub-digital` na server.
3. Pokrenite `npm start` (preporučeno preko `pm2` ili `systemd` da se server sam pokrene nakon restarta):
   ```bash
   npm install -g pm2
   pm2 start server.js --name orub-digital
   pm2 save
   pm2 startup
   ```
4. Ispred aplikacije postavite Nginx kao reverse proxy (za HTTPS/domen), npr:
   ```nginx
   server {
     listen 80;
     server_name orubdigital.com www.orubdigital.com;
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $remote_addr;
     }
   }
   ```
5. Za HTTPS koristite `certbot` (Let's Encrypt) — besplatno.

### Opcija B — Render / Railway / slični servisi

Ovi servisi automatski prepoznaju `package.json` i `npm start` komandu. Kod postavljanja:
- Build command: (ostaviti prazno, nema zavisnosti za instalaciju)
- Start command: `npm start`
- Dodajte **Persistent Disk / Volume** mapiran na folder `data/` (i `public/uploads/`), jer se u suprotnom baza i otpremljene slike brišu pri svakom redeploy-u.

> **Važno:** Pošto se sadržaj čuva u SQLite fajlu na disku, aplikacija zahtijeva hosting sa **trajnim diskom** (persistent storage). Serverless platforme (npr. Vercel) nisu pogodne bez dodatnih izmjena.

---

## 4. Admin panel — šta možete sami da radite (bez koda)

Prijavite se na `/admin` sa svojim nalogom. U panelu možete:

- **Pregled** — brza statistika i posljednji upiti.
- **Upiti klijenata** — svi upiti poslati preko kontakt forme sa sajta; možete ih označiti kao pročitane ili obrisati.
- **Podešavanja sajta** — naslov i podnaslov na početnoj, kratki opisi sekcija, kontakt podaci (e-mail, telefon, WhatsApp, Viber), grad/država, društvene mreže, SEO opis.
- **Usluge / Zašto ORUB DIGITAL / Kako radimo / Portfolio / Paketi i cijene / Utisci klijenata / Česta pitanja** — za svaku sekciju možete:
  - dodati novu stavku,
  - izmijeniti tekst (odvojeno za crnogorski i engleski),
  - otpremiti sliku sa računara ili nalijepiti link ka slici (portfolio i utisci),
  - sakriti/prikazati stavku bez brisanja,
  - promijeniti redoslijed prikaza (strelice gore/dole),
  - obrisati stavku.
- **Promjena lozinke / e-maila** — za prijavu u admin panel.

Sve izmjene se odmah vide na javnom sajtu, bez potrebe za redeploy ili osvježavanjem koda.

---

## 5. Jezik i tema sajta

- Posjetioci sajta prebacuju jezik (CG / EN) i temu (svijetla/tamna) dugmadima u zaglavlju — izbor se pamti u njihovom pretraživaču.
- Svaki dvojezični tekst se u adminu unosi posebno za crnogorski i engleski.

---

## 6. Sigurnosne napomene

- Admin lozinke se čuvaju heširane (scrypt), nikada u čistom tekstu.
- Prijava koristi sigurne sesije (HttpOnly kolačić) koje traju 7 dana.
- Postoji osnovna CSRF zaštita (provjera porijekla zahtjeva) za sve izmjene u adminu.
- Preporuka: uvijek koristite HTTPS na produkciji (vidi Nginx + certbot iznad).
- Fajl `data/orub.sqlite` sadrži heš lozinke i sve upite klijenata — čuvajte ga van javnog pristupa (podrazumevano nije dostupan preko sajta, jer se ne nalazi u `public/` folderu).

---

## 7. Podrška

Ako vam nešto zatreba (novi paket usluga, promjena strukture stranice, dodatni jezik i sl.), javite se razvojnom timu.
