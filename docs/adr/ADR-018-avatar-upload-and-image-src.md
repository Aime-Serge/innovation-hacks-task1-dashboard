# ADR-018: profile photo upload and link, `<img>` instead of `next/image`, and a relaxed `img-src`

**Status:** Accepted

**Context.** Registration gained an optional profile photo: upload a file, or paste a link to an
image already hosted somewhere else. Either way the result is a URL — a `data:` URL for an
uploaded file once the mock adapter reads it, a `blob:` object URL while a chosen file is only
previewed and not yet submitted, or an arbitrary `https:` URL for a pasted link — and `Avatar`
renders whichever the person has.

**Decision 1: `Avatar` renders a plain `<img>`, not `next/image`.**

`next/image`'s optimizer needs to know a source's host ahead of time (`remotePatterns`), which is
impossible here by definition: the whole point of "paste a link" is that the host is not known
until someone types it. Worse, `next/image` does not just decline to optimize a `blob:` source, it
throws while parsing it as a URL, which crashes the component outright during a photo's own
preview, before it is ever submitted. This was found by a test (`tests/unit/shell.test.tsx`,
uploading a file to preview it), not assumed. The `@next/next/no-img-element` lint rule is
therefore disabled at that one line, with a comment pointing here.

**Decision 2: `img-src` gains `blob:` and `https:`.**

The Pack's CSP was `img-src 'self' data:`. A `blob:` preview and a pasted `https:` link are both
image sources by design, so both need to be allowed or the feature does nothing in a real browser
(the image simply fails to load, which `Avatar`'s `onError` handler quietly turns into initials —
so this would have looked like it worked, without a person clicking through and checking, or a
browser console open). `img-src` is now `'self' data: blob: https:`; every other directive is
unchanged from the Pack.

**What this does not change.** The photo is still validated before it is ever used: `resolveAvatar`
in the mock adapter refuses a non-`https:` link, and refuses a file that is not PNG, JPEG or WebP
or larger than 500 KB, matching what `RegisterForm` checks up front for a faster message. A
rejected photo never reaches the account.

**Accepted risk.** `https:` in `img-src` means the browser will request an image from any host a
person pastes a link to, which was already implied by accepting a link at all; the app has no way
to allowlist hosts it cannot know in advance. This is a decorative `<img>` load, not a script or a
style source, so it carries none of the same-origin risks those directives guard against.
