import fetch from "node-fetch";
import { xml2json } from "xml-js";

type ArXivPaper = {
  id: string;
  title: string;
  summary: string;
};
type ArXivSearchResults = ArXivPaper[];

(async () => {
  const res = await fetch(
    'http://export.arxiv.org/api/query?search_query="voice+conversion"&max_results=1000'
  );
  const resTxt = await res.text();
  const resJson = JSON.parse(
    xml2json(resTxt, {
      compact: true
    })
  );
  //@ts-ignore
  const searchResults: ArXivSearchResults = resJson.feed.entry.map(result => ({
    id: result.id._text,
    title: result.title._text,
    summary: result.summary._text
  }));

  console.log(searchResults);
})();
