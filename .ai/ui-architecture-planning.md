<ui_architecture_planning_output>
<pytania>
1. Jak powinna wyglądać struktura nawigacji aplikacji - czy lepszy będzie układ z bocznym menu, górnym paskiem nawigacyjnym, czy inny format?
2. Czy użytkownicy powinni mieć dostęp do widoku podziału między notatkami własnymi a generowanymi przez AI, czy lepiej prezentować je razem z wyraźnym oznaczeniem?
3. Jaki poziom dostępu do profilu użytkownika jest wymagany w MVP - czy potrzebny jest dedykowany widok profilu, czy wystarczy prosty panel ustawień?
4. Jaki format powinny mieć karty notatek - np. czy powinny mieć stałą wysokość, czy dostosowywać się do zawartości?
5. Jak powinien wyglądać interfejs procesu generowania sugestii przez AI - czy użytkownik powinien móc wybrać, które notatki mają być brane pod uwagę, czy system powinien wykorzystywać wszystkie?
6. Czy podczas generowania propozycji przez AI powinien być widoczny wskaźnik postępu, czy animacja ładowania?
7. Jak powinna wyglądać metoda zarządzania stanem aplikacji - czy stosować kontekst Reacta, zustand, czy inną technologię?
8. W jaki sposób obsługiwać błędy API i wyświetlać komunikaty o niepowodzeniu?
9. Czy aplikacja powinna mieć tryb offline z możliwością synchronizacji po powrocie online?
10. Jakie szczegóły uwierzytelniania powinny być przechowywane w stanie aplikacji, a jakie w Supabase?
11. Czy notatki powinny mieć możliwość formatowania tekstu, czy wyłącznie tekst prosty?
12. Czy notatki powinny mieć dodatkowe metadane widoczne dla użytkownika (np. data utworzenia/modyfikacji)?
13. Jak dokładnie powinien być wizualnie wyróżniony podział na notatki użytkownika vs notatki AI?
14. Czy interfejs mobilny wymaga specjalnych dostosowań nawigacji lub układu elementów?
15. Jak zaimplementować system informacji zwrotnej podczas operacji CRUD na notatkach?
</pytania>

<rekomendacje>
1. Implementacja prostego, jednolitego layoutu z górnym paskiem nawigacyjnym zawierającym logo, przyciski akcji (logowanie/wylogowanie) oraz ewentualny przycisk menu dla urządzeń mobilnych.
2. Wykorzystanie układu dwukolumnowego dla głównego widoku aplikacji na desktop: lewa kolumna zawierająca listę notatek, prawa kolumna wyświetlająca aktualnie wybraną notatkę lub formularz tworzenia/edycji.
3. Na urządzeniach mobilnych zastosowanie układu jednolumnowego z przełączaniem między widokiem listy a szczegółami notatki.
4. Implementacja systemu zakładek lub filtrów do przełączania między widokiem wszystkich notatek, notatek użytkownika i notatek AI.
5. Wyraźne oznaczenie notatek AI przez zastosowanie innego koloru tła, ikony lub specjalnego znacznika.
6. Wykorzystanie komponentów Toast z biblioteki Shadcn/ui do wyświetlania powiadomień o sukcesie/błędzie po operacjach CRUD i generowaniu sugestii AI.
7. Implementacja formularzy logowania/rejestracji jako osobnych stron z przekierowaniem do głównego widoku po pomyślnej autoryzacji.
8. Zastosowanie mechanizmu stanu globalnego (np. kontekst React lub Zustand) do przechowywania informacji o zalogowanym użytkowniku i jego notatkach.
9. Implementacja widoku ładowania (skeleton loader) podczas pobierania danych z API dla poprawy UX.
10. Wykorzystanie prostego edytora tekstu dla notatek, bez formatowania w MVP, ale z możliwością łatwego rozszerzenia w przyszłości.
11. Implementacja modalnego okna potwierdzenia dla operacji usuwania notatek.
12. Zastosowanie infinite scroll lub paginacji dla listy notatek, aby efektywnie obsługiwać dużą liczbę wpisów.
13. Utworzenie dedykowanego widoku "generowania sugestii AI" z wyraźnym przyciskiem akcji i animacją podczas przetwarzania.
14. Implementacja responsywnego designu z wykorzystaniem klas Tailwind dla wszystkich breakpointów (sm, md, lg, xl).
15. Wykorzystanie kontekstu dark/light mode zgodnie z preferencjami użytkownika i możliwością przełączania.
</rekomendacje>
</ui_architecture_planning_output>
