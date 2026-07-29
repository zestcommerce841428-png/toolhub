/**
 * Line-level text diff via the classic Longest Common Subsequence
 * dynamic-programming algorithm (the same underlying idea `diff`/`git
 * diff` are built on, simplified to line granularity rather than
 * character/token granularity). LCS gives the minimal set of add/remove
 * operations that turns text A into text B.
 */

// The DP table is O(linesA * linesB) cells — guard against pathologically
// large inputs freezing the tab rather than letting them silently hang.
const MAX_CELLS = 4_000_000;

/**
 * @param {string} textA
 * @param {string} textB
 * @returns {{ ok: true, diff: Array<{type:"equal"|"add"|"remove", line:string}> } | { ok: false, error: string }}
 */
export function computeLineDiff(textA, textB) {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  const n = linesA.length;
  const m = linesB.length;

  if (n * m > MAX_CELLS) {
    return { ok: false, error: `Too large to diff in the browser (${n} × ${m} lines) — try comparing smaller sections.` };
  }

  // dp[i][j] = length of the LCS of linesA[i..] and linesB[j..]
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const diff = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (linesA[i] === linesB[j]) {
      diff.push({ type: "equal", line: linesA[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: "remove", line: linesA[i] });
      i++;
    } else {
      diff.push({ type: "add", line: linesB[j] });
      j++;
    }
  }
  while (i < n) diff.push({ type: "remove", line: linesA[i++] });
  while (j < m) diff.push({ type: "add", line: linesB[j++] });

  return { ok: true, diff };
}

/** @param {Array<{type:string}>} diff @returns {{ additions: number, removals: number, unchanged: number }} */
export function summarizeDiff(diff) {
  return diff.reduce(
    (summary, entry) => {
      if (entry.type === "add") summary.additions++;
      else if (entry.type === "remove") summary.removals++;
      else summary.unchanged++;
      return summary;
    },
    { additions: 0, removals: 0, unchanged: 0 }
  );
}
