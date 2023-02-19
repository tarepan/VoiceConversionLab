import fetch from "node-fetch";
import { xml2json } from "xml-js";
import { ArXivSearchResults, SearchedPaper } from "./domain";

/**
 * Remove new lines and long white spaces after them.
 */
export function removeNewline(str: string): string {
  const regex = /\n +/g;
  return str.replaceAll(regex, ' ');
}

export async function searchArXiv(): Promise<ArXivSearchResults> {
  const res = await fetch(
    'http://export.arxiv.org/api/query?search_query="voice+conversion"&max_results=1000'
  );
  const resTxt = await res.text();
  const resJson = JSON.parse(
    xml2json(resTxt, {
      compact: true,
    })
  );
  return resJson.feed.entry.map(
    //@ts-ignore
    (result): SearchedPaper => ({
      id: result.id._text,
      title: removeNewline(result.title._text),
      summary: result.summary._text,
    })
  );
}

export async function searchArXivByID(id: string): Promise<SearchedPaper> {
  const res = await fetch(
    `http://export.arxiv.org/api/query?id_list=${id}&max_results=1000`
  );
  const resTxt = await res.text();
  const resJson = JSON.parse(
    xml2json(resTxt, {
      compact: true,
    })
  );
  return {
    id: resJson.feed.entry.id._text,
    title: removeNewline(resJson.feed.entry.title._text),
    summary: resJson.feed.entry.summary._text,
  };
}

if (require.main === module) {
  (async () => {
    const res = await searchArXivByID("2302.08296v1");
    console.log(res)
  })();
}
