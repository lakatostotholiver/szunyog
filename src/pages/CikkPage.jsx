import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cikkek } from '../lib/cms';

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CikkPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    cikkek
      .list()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((a) => a.slug === slug);
        setArticle(found ?? null);
        setStatus(found ? 'ready' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        Betöltés…
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <h1>A cikk nem található</h1>
        <p>Lehet, hogy időközben eltávolították.</p>
        <Link to="/hirek" className="btn btn-outline">&larr; Vissza a hírekhez</Link>
      </div>
    );
  }

  // A szerkesztő üres sorral választ bekezdést – ezt tartjuk meg formázásként.
  const paragraphs = article.body.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner enter">
          <div className="kicker">{article.tag}</div>
          <h1>{article.title}</h1>
          <p className="article-date">{formatDate(article.publishDate)}</p>
        </div>
      </div>

      <section>
        <div className="container article-body">
          {article.coverUrl && (
            <img className="article-cover" src={article.coverUrl} alt="" />
          )}
          {article.lead && <p className="article-lead">{article.lead}</p>}
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <p style={{ marginTop: '2rem' }}>
            <Link to="/hirek" className="btn btn-outline">&larr; Összes hír</Link>
          </p>
        </div>
      </section>
    </>
  );
}
