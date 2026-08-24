import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cikkek } from '../lib/cms';

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function HirekPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    cikkek
      .list()
      .then((list) => {
        if (!cancelled) setArticles(list);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner enter">
          <div className="kicker">Hírek</div>
          <h1>Tájékoztatók és közlemények</h1>
          <p>
            A szúnyogmonitoring programmal kapcsolatos tájékoztatók, lakossági felhívások és
            szakmai összefoglalók.
          </p>
        </div>
      </div>

      <section>
        <div className="container">
          {loading ? (
            <p>Betöltés…</p>
          ) : articles.length === 0 ? (
            <p>Jelenleg nincs közzétett cikk.</p>
          ) : (
            <div className="article-list reveal-group">
              {articles.map((article) => (
                <article className="article-card reveal" key={article.id}>
                  {article.coverUrl && (
                    <Link to={`/hirek/${article.slug}`} className="article-card-cover">
                      <img src={article.coverUrl} alt="" />
                    </Link>
                  )}
                  <div className="article-card-body">
                    <div className="article-card-meta">
                      <span>{formatDate(article.publishDate)}</span>
                      <span className="news-card-tag">{article.tag}</span>
                    </div>
                    <h2>
                      <Link to={`/hirek/${article.slug}`}>{article.title}</Link>
                    </h2>
                    {article.lead && <p>{article.lead}</p>}
                    <Link to={`/hirek/${article.slug}`} className="news-card-link">
                      Tovább olvasom →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
