/**
 * The IANA-registered HTTP status codes (RFC 9110 plus the WebDAV,
 * rate-limiting, and early-hints RFCs that added a few others) — a
 * complete reference, not a "common codes only" shortlist.
 */

export const STATUS_CODES = [
  { code: 100, name: "Continue", category: "Informational", description: "The server has received the request headers and the client should proceed to send the request body." },
  { code: 101, name: "Switching Protocols", category: "Informational", description: "The server is switching protocols as requested by the client (e.g. to WebSocket) via an Upgrade header." },
  { code: 102, name: "Processing", category: "Informational", description: "(WebDAV) The server has received and is processing the request, but no response is available yet." },
  { code: 103, name: "Early Hints", category: "Informational", description: "Used to return some response headers before the final HTTP message, e.g. to let a browser start preloading resources." },

  { code: 200, name: "OK", category: "Success", description: "The request succeeded. The meaning of success depends on the HTTP method used." },
  { code: 201, name: "Created", category: "Success", description: "The request succeeded and a new resource was created as a result." },
  { code: 202, name: "Accepted", category: "Success", description: "The request has been received but not yet acted upon; processing may not have completed." },
  { code: 203, name: "Non-Authoritative Information", category: "Success", description: "The returned metadata isn't exactly as available from the origin server, but from a local or third-party copy." },
  { code: 204, name: "No Content", category: "Success", description: "The request succeeded but there's no content to send, and the page should not change." },
  { code: 205, name: "Reset Content", category: "Success", description: "The request succeeded; the client should reset the document view that sent the request." },
  { code: 206, name: "Partial Content", category: "Success", description: "Used for range requests — the server is delivering only part of the resource due to a Range header." },
  { code: 207, name: "Multi-Status", category: "Success", description: "(WebDAV) Conveys information about multiple resources in situations where multiple status codes may be appropriate." },
  { code: 208, name: "Already Reported", category: "Success", description: "(WebDAV) Used inside a DAV binding to avoid enumerating the internal members of multiple bindings repeatedly." },
  { code: 226, name: "IM Used", category: "Success", description: "The server has fulfilled a GET request, and the response is a representation of the result of one or more instance manipulations." },

  { code: 300, name: "Multiple Choices", category: "Redirection", description: "The request has more than one possible response; the client should choose one." },
  { code: 301, name: "Moved Permanently", category: "Redirection", description: "The resource has been permanently moved to a new URL, given in the Location header." },
  { code: 302, name: "Found", category: "Redirection", description: "The resource temporarily resides at a different URL; the original URL should continue to be used for future requests." },
  { code: 303, name: "See Other", category: "Redirection", description: "The response can be found at another URL using a GET request, regardless of the original request's method." },
  { code: 304, name: "Not Modified", category: "Redirection", description: "The resource hasn't been modified since the version specified by conditional request headers — no body is sent." },
  { code: 305, name: "Use Proxy", category: "Redirection", description: "Deprecated. Previously indicated the requested resource must be accessed through the proxy given by the Location header." },
  { code: 307, name: "Temporary Redirect", category: "Redirection", description: "Like 302, but the request method and body must not change when reissued to the new URL." },
  { code: 308, name: "Permanent Redirect", category: "Redirection", description: "Like 301, but the request method and body must not change when reissued to the new URL." },

  { code: 400, name: "Bad Request", category: "Client Error", description: "The server can't process the request due to a client error — malformed syntax, invalid framing, or deceptive routing." },
  { code: 401, name: "Unauthorized", category: "Client Error", description: "Authentication is required and has failed or not been provided." },
  { code: 402, name: "Payment Required", category: "Client Error", description: "Reserved for future use; occasionally used by APIs to indicate a payment is required to proceed." },
  { code: 403, name: "Forbidden", category: "Client Error", description: "The client's identity is known but it does not have access rights to the content." },
  { code: 404, name: "Not Found", category: "Client Error", description: "The server can't find the requested resource." },
  { code: 405, name: "Method Not Allowed", category: "Client Error", description: "The request method is known by the server but is not supported by the target resource." },
  { code: 406, name: "Not Acceptable", category: "Client Error", description: "No content matching the criteria given by the client's Accept headers is available." },
  { code: 407, name: "Proxy Authentication Required", category: "Client Error", description: "Like 401, but authentication is needed to be performed by a proxy." },
  { code: 408, name: "Request Timeout", category: "Client Error", description: "The server timed out waiting for the request from the client." },
  { code: 409, name: "Conflict", category: "Client Error", description: "The request conflicts with the current state of the target resource." },
  { code: 410, name: "Gone", category: "Client Error", description: "The requested content has been permanently deleted, with no forwarding address." },
  { code: 411, name: "Length Required", category: "Client Error", description: "The server refused the request because a required Content-Length header was not defined." },
  { code: 412, name: "Precondition Failed", category: "Client Error", description: "One or more conditions in the request's conditional headers evaluated to false." },
  { code: 413, name: "Payload Too Large", category: "Client Error", description: "The request body is larger than the server is willing or able to process." },
  { code: 414, name: "URI Too Long", category: "Client Error", description: "The URI requested by the client is longer than the server is willing to interpret." },
  { code: 415, name: "Unsupported Media Type", category: "Client Error", description: "The media format of the requested body is not supported by the server." },
  { code: 416, name: "Range Not Satisfiable", category: "Client Error", description: "The range specified by the Range header can't be fulfilled." },
  { code: 417, name: "Expectation Failed", category: "Client Error", description: "The expectation given in the request's Expect header couldn't be met." },
  { code: 418, name: "I'm a Teapot", category: "Client Error", description: "An April Fools' RFC joke (2324/7168) — the server refuses to brew coffee because it is, permanently, a teapot." },
  { code: 421, name: "Misdirected Request", category: "Client Error", description: "The request was directed at a server that is not able to produce a response for this combination of scheme/authority." },
  { code: 422, name: "Unprocessable Entity", category: "Client Error", description: "The request was well-formed but semantically incorrect and couldn't be processed." },
  { code: 423, name: "Locked", category: "Client Error", description: "(WebDAV) The resource being accessed is locked." },
  { code: 424, name: "Failed Dependency", category: "Client Error", description: "(WebDAV) The request failed because it depended on another request that failed." },
  { code: 425, name: "Too Early", category: "Client Error", description: "The server is unwilling to risk processing a request that might be replayed." },
  { code: 426, name: "Upgrade Required", category: "Client Error", description: "The server refuses to perform the request using the current protocol but might do so after the client upgrades." },
  { code: 428, name: "Precondition Required", category: "Client Error", description: "The origin server requires the request to be conditional, to prevent a lost-update race condition." },
  { code: 429, name: "Too Many Requests", category: "Client Error", description: "The user has sent too many requests in a given amount of time (rate limiting)." },
  { code: 431, name: "Request Header Fields Too Large", category: "Client Error", description: "The server is unwilling to process the request because its header fields are too large." },
  { code: 451, name: "Unavailable For Legal Reasons", category: "Client Error", description: "The requested resource is unavailable due to a legal demand to deny access to it." },

  { code: 500, name: "Internal Server Error", category: "Server Error", description: "The server encountered an unexpected condition that prevented it from fulfilling the request." },
  { code: 501, name: "Not Implemented", category: "Server Error", description: "The request method isn't supported by the server and can't be handled." },
  { code: 502, name: "Bad Gateway", category: "Server Error", description: "The server, acting as a gateway, received an invalid response from an upstream server." },
  { code: 503, name: "Service Unavailable", category: "Server Error", description: "The server isn't ready to handle the request — often due to maintenance or being overloaded." },
  { code: 504, name: "Gateway Timeout", category: "Server Error", description: "The server, acting as a gateway, didn't get a response in time from an upstream server." },
  { code: 505, name: "HTTP Version Not Supported", category: "Server Error", description: "The HTTP version used in the request isn't supported by the server." },
  { code: 506, name: "Variant Also Negotiates", category: "Server Error", description: "Transparent content negotiation for the request results in a circular reference." },
  { code: 507, name: "Insufficient Storage", category: "Server Error", description: "(WebDAV) The server is unable to store the representation needed to complete the request." },
  { code: 508, name: "Loop Detected", category: "Server Error", description: "(WebDAV) The server detected an infinite loop while processing the request." },
  { code: 510, name: "Not Extended", category: "Server Error", description: "Further extensions to the request are required for the server to fulfill it." },
  { code: 511, name: "Network Authentication Required", category: "Server Error", description: "The client needs to authenticate to gain network access (e.g. a captive portal)." },
];

export const CATEGORIES = ["Informational", "Success", "Redirection", "Client Error", "Server Error"];

/**
 * @param {string} query - matched against code (prefix) and name/description (substring, case-insensitive)
 * @param {string} [category] - one of CATEGORIES, or "" for all
 * @returns {typeof STATUS_CODES}
 */
export function searchStatusCodes(query, category = "") {
  const trimmedQuery = query.trim().toLowerCase();
  return STATUS_CODES.filter((entry) => {
    if (category && entry.category !== category) return false;
    if (!trimmedQuery) return true;
    return (
      String(entry.code).startsWith(trimmedQuery) ||
      entry.name.toLowerCase().includes(trimmedQuery) ||
      entry.description.toLowerCase().includes(trimmedQuery)
    );
  });
}
