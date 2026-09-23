# Loto 6/45

Web-aplikacija koja simulira evidentiranje uplata loto listića 6/45, izvlačenje brojeva i provjeru rezultata putem QR koda. Prijavljeni korisnici uplaćuju listiće kroz web-sučelje, dok se upravljanje kolima (otvaranje/zatvaranje uplata, unos izvučenih brojeva) obavlja putem zaštićenih API pristupnih točaka namijenjenih strojnoj (machine-to-machine) komunikaciji.

## Sadržaj

- [Značajke](#značajke)
- [Arhitektura i tehnologije](#arhitektura-i-tehnologije)
- [Struktura repozitorija](#struktura-repozitorija)
- [Autentifikacija i autorizacija](#autentifikacija-i-autorizacija)
- [API pristupne točke](#api-pristupne-točke)
- [Model podataka](#model-podataka)
- [Pokretanje projekta lokalno](#pokretanje-projekta-lokalno)
- [Varijable okoline](#varijable-okoline)
- [Deployment](#deployment)

## Značajke

- Prijava korisnika putem OpenID Connect (Auth0), sesija se čuva u PostgreSQL bazi.
- Uplata loto listića (6 do 10 jedinstvenih brojeva u rasponu 1–45 te broj osobne iskaznice/putovnice) uz validaciju unosa na frontendu i backendu.
- Generiranje jedinstvenog identifikatora listića (UUID) i pripadajućeg QR koda (PNG) koji vodi na javno dostupnu stranicu s podacima o listiću.
- Javna stranica listića prikazuje uplaćene brojeve i, ako su već izvučeni, izvučene brojeve te broj pogodaka.
- Početna stranica prikazuje prijavljenog korisnika, broj uplaćenih listića u trenutnom kolu, izvučene brojeve (kad su dostupni) te poveznicu na uplatu dok su uplate aktivne.
- Upravljanje kolima (aktivacija, zatvaranje, unos izvučenih brojeva) putem zasebnih, strojno-orijentiranih pristupnih točaka zaštićenih OAuth2 Client Credentials tokenom (Auth0 M2M).

## Arhitektura i tehnologije

**Backend** (`/backend`)
- Node.js + TypeScript, Express 5
- `pg` za pristup PostgreSQL bazi
- `openid-client` za OpenID Connect (Authorization Code + PKCE) prijavu korisnika preko Auth0
- `express-oauth2-jwt-bearer` za provjeru JWT tokena na M2M pristupnim točkama
- `express-session` + `connect-pg-simple` za sesije pohranjene u bazi
- `qrcode` za generiranje QR koda uplaćenog listića

**Frontend** (`/frontend`)
- React 19 + TypeScript, Vite
- React Router za navigaciju (`/`, `/uplata`, `/ticket/:id`)
- Tailwind CSS 4 za stiliziranje
- Axios za komunikaciju s backend API-jem

Backend u produkcijskoj izgradnji poslužuje i statičke datoteke frontenda (build skripta kopira `frontend/dist` u `backend/public`), pa se cijela aplikacija isporučuje kao jedna Node.js usluga.

## Struktura repozitorija

```
backend/
  src/
    database/     # konekcija na PostgreSQL i migracijska skripta
    middleware/    # sesije, provjera prijave, provjera JWT (M2M)
    routes/        # auth, admin (M2M), rounds, tickets
    utils/         # validacija ulaznih podataka
    index.ts        # ulazna točka Express aplikacije
frontend/
  src/
    pages/          # Home, SubmitTicket, TicketView
    services/       # API klijent (axios)
```

## Autentifikacija i autorizacija

U aplikaciji postoje dva odvojena sigurnosna mehanizma:

1. **OpenID Connect (Auth0)** — za korisnike koji uplaćuju listiće. Prijava koristi Authorization Code Flow s PKCE (`/auth/login`, `/auth/callback`), a podaci o prijavljenom korisniku čuvaju se u poslužiteljskoj sesiji (`/auth/user`, `/auth/logout`). Pristupna točka za slanje listića (`POST /api/tickets`) zahtijeva aktivnu sesiju.
2. **OAuth2 Client Credentials (M2M, Auth0)** — za vanjsku/administratorsku aplikaciju koja upravlja kolima. Pristupne točke `/new-round`, `/close` i `/store-results` zahtijevaju valjani JWT bearer token izdan za odgovarajuću audience vrijednost i ne koriste korisničku sesiju.

## API pristupne točke

| Metoda | Ruta | Zaštita | Opis |
|---|---|---|---|
| GET | `/auth/login` | – | Preusmjerava na Auth0 prijavu (OIDC + PKCE) |
| GET | `/auth/callback` | – | OIDC callback, sprema korisnika u sesiju |
| GET | `/auth/user` | sesija | Podaci o trenutno prijavljenom korisniku |
| GET | `/auth/logout` | – | Odjava i uništavanje sesije |
| GET | `/api/rounds/current` | – | Status trenutnog kola (aktivnost, broj listića, izvučeni brojevi) |
| POST | `/api/tickets` | sesija | Uplata listića; vraća QR kod kao `image/png` |
| GET | `/api/tickets/:id` | – | Javni podaci o listiću i izvučenim brojevima (odredište QR koda) |
| POST | `/new-round` | M2M JWT | Aktivira novo kolo (204, bez efekta ako je već aktivno) |
| POST | `/close` | M2M JWT | Zatvara trenutno kolo (204, bez efekta ako nema aktivnog) |
| POST | `/store-results` | M2M JWT | Sprema izvučene brojeve (`{ "numbers": number[] }`); 400 ako je kolo aktivno ili brojevi već izvučeni |

## Model podataka

- **rounds** — `id`, `is_active`, `drawn_numbers` (niz brojeva), `created_at`
- **tickets** — `id` (UUID), `round_id`, `id_number`, `numbers` (niz brojeva), `created_at`
- **session** — standardna `connect-pg-simple` tablica za pohranu sesija

Shema se generira skriptom `backend/src/database/migrate.ts`.

## Pokretanje projekta lokalno

Preduvjeti: Node.js, pristup PostgreSQL bazi te Auth0 tenant s konfiguriranom Regular Web Application (za OIDC prijavu) i M2M aplikacijom (za admin pristupne točke).

```bash
# Backend
cd backend
npm install
cp .env.example .env   # popuniti stvarnim vrijednostima
npm run migrate         # kreira tablice u bazi
npm run dev              # pokreće API na PORT (zadano 3001)

# Frontend (odvojeno, u razvoju)
cd frontend
npm install
npm run dev
```

Za produkcijsku izgradnju (backend poslužuje i frontend iz `backend/public`):

```bash
cd backend
npm run build
npm run start
```

## Varijable okoline

Backend očekuje sljedeće varijable (vidi `backend/.env.example`):

| Varijabla | Opis |
|---|---|
| `DATABASE_URL` | Connection string za PostgreSQL |
| `PORT` | Port na kojem sluša backend |
| `NODE_ENV` | `development` / `production` |
| `FRONTEND_URL` | Javna adresa aplikacije (koristi se za OIDC redirect i generiranje QR koda) |
| `SESSION_SECRET` | Tajni ključ za potpisivanje sesijskih kolačića |
| `AUTH0_ISSUER_BASE_URL` | Adresa Auth0 tenanta |
| `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` | Podaci OIDC klijentske aplikacije |
| `AUTH0_CALLBACK_URL` | Callback adresa za OIDC prijavu |
| `AUTH0_AUDIENCE` | Audience vrijednost za M2M JWT tokene |

Nijedna od ovih vrijednosti se ne sprema u repozitorij — `.env` datoteke su isključene putem `.gitignore`.

## Deployment

Aplikacija je zamišljena za isporuku kao jedna Node.js usluga (npr. na Renderu), gdje build korak izgrađuje frontend i poslužuje ga statički kroz Express, dok se za pohranu podataka koristi PostgreSQL instanca u oblaku.
