// The API serves `source` as a plain string, so we have to guess whether it
// holds a website or the name of a book.

// Printable ASCII only, anything else has to come with a scheme.
const ASCII_ONLY = /^[\x20-\x7E]+$/;

// Dot separated labels, ending in an alphabetic TLD of 2 or more chars.
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
 * Resolve a source to a url usable as an `href`, or null when it should be
 * shown as plain text. Schemeless domains get `https://` prepended, so bind
 * the result rather than the original source.
 */
export function resolveSourceUrl(source: string | null | undefined): string | null {
    if (!source) {
        return null;
    }

    const value = source.trim();

    if (!value) {
        return null;
    }

    if (HAS_HTTP_SCHEME.test(value)) {
        return toHttpUrl(value);
    }

    // Keep book and bar names out of the link branch.
    if (!ASCII_ONLY.test(value) || /\s/.test(value)) {
        return null;
    }

    const [host] = value.split(/[/?#]/);

    if (!DOMAIN_LIKE.test(host)) {
        return null;
    }

    return toHttpUrl(`https://${value}`);
}
