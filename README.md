# Everlast Rechtsberater
Dieses Programm dient dazu, einen Rechtstext einzulesen, über einen Embedder zu vektorisieren und im Anschluss daran Fragen darüber stellen zu können. 

Das Ganze kann ohne User benutzt werden, bietet jedoch zusätzlich die Möglichkeit, sich zu registrieren und im Anschluss seine Chats historiert zu lesen.

## Tech-Stack
Für dieses Programm wird **NextJS** als Fullstack-Framework verwendet. Für die Persistenz von Chats und Usern verwende ich **Supabase**. Darüberhinaus wird **QDRANT** als Vektordatenbank verwendet, um die Vektoren für das RAG-System abspeichern zu können. Für GenAI-Features wird die AI-SDK von Vercel verwendet. 

## Ansatz
1. Zunächst setze ich das NextJS Projekt über den Command `npx create-next-app -e with-supabase` auf.
2. Ich installiere 
    - `npm i ai` für GenAI Prozesse
    - `npm install @qdrant/js-client-rest` für eine QDRANT Anbindung
3. Ich entferne nicht benötigte pages und routes
4. Aufsetzen eines Supabase Projektes
    - Hier könnte man mehrere Branches erstellen, jedoch benutze ich einen Branch für Env und Prod - der Einfachheit wegen
5. Ich benutze die AI SDK von Vercel und greife auf die Provider über den Vercel AI Gateway zu
6. Ich erstelle den Route Handler für die AI s. `app/api/chat/route.ts`
7. Ich verwende das `page.tsx`template und passe es nach meinen Bedürfnissen an.
8. Ich erstelle lib/rag.ts für alles, was mit RAG zu tun hat (auch Anbindung an QDRANT)
    - Die Funktionen sind selbsterklärend, aber hier eine grobe Zusammenfassung: 
        1. Funktionen für das Verbinden mit QDRANT sowie dem Hochladen und Abfragen von Vektoren
        2. Funktionen zum "Embedden" von Text
        3. Funktionen zum Chunken von Text (sowohl fest als auch regex-basiert)
        4. Funktionen zum Verarbeiten von PDF in Text
9. Aufsetzen eine QDRANT Services + erstellung einer "global" Collection
10. Eine /rag/page.tsx zum Hochladen von PDF und Verarbeitung in Vektoren
11. Eine /api/chat/route.ts zum Verarbeiten von Chat-Anfragen (Standard der AI-SDK)
12. Eine use-data Hook, der die Chats des Users hält sowie die aktuelle Chat-ID

## Bedienung der Software
### Hauptseite ('/')
Hier ist der Chat mit dem Bot möglich, sowohl angemeldet als auch unangemeldet. Ist man **nicht angemeldet**, so wird der Chat nicht gespeichert. Im **eingeloggten** Zustand wird beim initialen Laden der Seite ein leerer Chat clientseitig erstellt. Das Speichern erfolgt durch Speicherung der `UIMessage` Objekte als jsonb-Liste in Supabase unter der Tabelle "Chat". Eine Speicherung wird nach jeder generierten Antwort durchgeführt.


### RAG ('/rag')
Hier lassen sich beliebige PDF-Dokumente hochladen. Diese werden dann embedded und in QDRANT hochgeladen. Dadurch kann man auf der Hauptseite Fragen zu den hochgeladenen Dokumenten stellen.

## Hinweis
Man hätte vieles besser machen können. Darunter eine sauberere Architektur und schöneren Code. Aber ich habe diesen Task u.A. als Herausforderung gesehen, nahazu vollständig auf die Nutzung von KI zu verzichten, um mir selber zu beweisen, dass ich einer solchen Aufgabe gewachsen bin. Darüber hinaus hat auch die Zeit eine große Rolle gespielt.


## Starten des Projekts

### Pre-Requirements
1. Supabase Projekt, welches eine `public.chat` Tabelle beinhaltet
2. QDRANT-Service, welcher eine `global` collection beinhaltet

### Schritte

1. Die `.env.example` in `.env` umbenennen oder kopieren und Werte einsetzen
2. `npm run build`
3. `npm start`

