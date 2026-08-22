import { expect, test } from "vitest";
import { resolveSourceUrl } from "./../sourceLink";

test("full urls are kept as links", () => {
    expect(resolveSourceUrl("https://example.com/recipe")).toBe("https://example.com/recipe");
    expect(resolveSourceUrl("http://diffordsguide.com/cocktail/123")).toBe("http://diffordsguide.com/cocktail/123");
    expect(resolveSourceUrl("HTTPS://EXAMPLE.COM")).toBe("https://example.com/");
    expect(resolveSourceUrl("  https://example.com  ")).toBe("https://example.com/");
});

test("schemeless domains are resolved to absolute urls", () => {
    expect(resolveSourceUrl("example.com")).toBe("https://example.com/");
    expect(resolveSourceUrl("www.diffordsguide.com")).toBe("https://www.diffordsguide.com/");
    expect(resolveSourceUrl("punchdrink.com/recipes/the-last-word/")).toBe("https://punchdrink.com/recipes/the-last-word/");
    expect(resolveSourceUrl("en.wikipedia.org/wiki/Sidecar_(cocktail)")).toBe("https://en.wikipedia.org/wiki/Sidecar_(cocktail)");
});

test("book and bar names are not links", () => {
    expect(resolveSourceUrl("Smuggler's Cove")).toBeNull();
    expect(resolveSourceUrl("Mr. Boston")).toBeNull();
    expect(resolveSourceUrl("The Savoy Cocktail Book")).toBeNull();
    expect(resolveSourceUrl("Death & Co")).toBeNull();
    expect(resolveSourceUrl("Death&Co")).toBeNull();
    expect(resolveSourceUrl("Imbibe!")).toBeNull();
    expect(resolveSourceUrl("Employees Only")).toBeNull();
    expect(resolveSourceUrl("The Joy of Mixology, p. 214")).toBeNull();
});

test("a domain shaped label is required", () => {
    expect(resolveSourceUrl("Vol.2")).toBeNull();
    expect(resolveSourceUrl("S.C.")).toBeNull();
    expect(resolveSourceUrl("example.")).toBeNull();
    expect(resolveSourceUrl("Cocktail Codex")).toBeNull();
});

test("schemeless values must be ascii and free of whitespace", () => {
    expect(resolveSourceUrl("Cocktailkunst — Moderne Bar")).toBeNull();
    expect(resolveSourceUrl("Bücher.de")).toBeNull();
    expect(resolveSourceUrl("example.com is a nice site")).toBeNull();
    expect(resolveSourceUrl("https://bücher.de")).toBe("https://xn--bcher-kva.de/");
});

test("only http(s) can end up in an href", () => {
    expect(resolveSourceUrl("javascript:alert(1)")).toBeNull();
    expect(resolveSourceUrl("JavaScript:alert(1)")).toBeNull();
    expect(resolveSourceUrl("javascript:alert(1)//evil.com")).toBeNull();
    expect(resolveSourceUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(resolveSourceUrl("vbscript:msgbox(1)")).toBeNull();
    expect(resolveSourceUrl("//evil.com")).toBeNull();
    expect(resolveSourceUrl('evil.com" onmouseover="alert(1)')).toBeNull();
});

test("empty sources are not links", () => {
    expect(resolveSourceUrl(null)).toBeNull();
    expect(resolveSourceUrl(undefined)).toBeNull();
    expect(resolveSourceUrl("")).toBeNull();
    expect(resolveSourceUrl("   ")).toBeNull();
});

test("real sources from the bar-assistant/data recipe set", () => {
    expect(resolveSourceUrl("https://iba-world.com/692/")).toBe("https://iba-world.com/692/");
    expect(resolveSourceUrl("https://jeffreymorgenthaler.com/i-make-the-best-amaretto-sour-in-the-world/")).toBe(
        "https://jeffreymorgenthaler.com/i-make-the-best-amaretto-sour-in-the-world/",
    );
    expect(resolveSourceUrl("Beachbum Berry's Grog Log by Jeff Berry & Annene Kaye, p. 66.")).toBeNull();
    expect(resolveSourceUrl("Douglas Ankrah, The Townhouse | London")).toBeNull();
    expect(resolveSourceUrl("Wardman Park Hotel, Washington, D. C.")).toBeNull();
    expect(resolveSourceUrl("Jim Meehan [2012]")).toBeNull();
    expect(resolveSourceUrl("Trader Vic")).toBeNull();
    // A single word with no dot, which the old logic linked to a broken relative url.
    expect(resolveSourceUrl("Mexico")).toBeNull();
});

test("resolved links are always absolute", () => {
    for (const source of ["example.com", "www.example.com/path", "https://example.com"]) {
        expect(resolveSourceUrl(source)).toMatch(/^https?:\/\//);
    }
});
