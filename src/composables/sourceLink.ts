/**
 * The API serves `source` as a plain string, with no indication of whether it
 * holds a website or the name of a book, so we have to guess.
 *
 * A value is treated as a link when it either carries an explicit http(s)
 * scheme, or looks unambiguously like a bare domain. To keep book and bar names
 * such as "Smuggler's Cove" or "Mr. Boston" out of the link branch, a
 * schemeless value additionally has to be plain ASCII, free of whitespace, and
 * end in a domain-shaped label.
 */

// Printable ASCII only: anything outside of it has to come with a scheme.
const ASCII_ONLY = /^[\x20-\x7E]+$/;

// One or more dot separated labels, ending in an alphabetic TLD of 2+ chars.
const DOMAIN_LIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

const HAS_HTTP_SCHEME = /^https?:\/\//i;

function toHttpUrl(candidate: string): string | null {
    let url;

    try {
        url = new URL(candidate);
    } catch (err) {
        return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
    }

    return url.toString();
}

/**
 * Resolve a source string to a URL usable as an `href`, or null when the source
 * should be shown as plain text. Schemeless domains get `https://` prepended,
 * so the caller must bind this result rather than the raw source.
 */
export function resolveSourceUrl(source: string | null | undefined): string | null {
    if (!source) {
        return null;
    }

    const value = source.trim();

    if (!value) {
        return null;
    }

    // An explicit scheme is a statement of intent, so take it at face value.
    // Internationalized domains are fine here, URL() punycodes them for us.
    if (HAS_HTTP_SCHEME.test(value)) {
        return toHttpUrl(value);
    }

    if (!ASCII_ONLY.test(value) || /\s/.test(value)) {
        return null;
    }

    const [host] = value.split(/[/?#]/);

    if (!DOMAIN_LIKE.test(host)) {
        return null;
    }

    return toHttpUrl(`https://${value}`);
}
