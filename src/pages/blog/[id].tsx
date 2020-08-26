import moment from 'moment';
import React from 'react';
import { FiCalendar, FiClock, FiTag } from 'react-icons/fi';
import { BlogPost, getBlogPost, getBlogPosts } from '../../infra/content';
import { humanizeTimeToRead } from '../../infra/utils';
import Layout from '../../shared/layout';
import Link from '../../shared/link';

interface BlogPostPageProps {
  blogPost: BlogPost;
}

export function getStaticPaths() {
  const ids = getBlogPosts().map((blogPost) => blogPost.id);

  const paths = ids.map((id) => ({
    params: { id }
  }));

  return {
    paths,
    fallback: false
  };
}

export function getStaticProps({ params }: { params: { id: string } }) {
  const { id } = params;
  const blogPost = getBlogPost(id);

  const props = {
    blogPost
  } as BlogPostPageProps;

  return { props };
}

export default function BlogPostPage({ blogPost }: BlogPostPageProps) {
  return (
    <Layout meta={{ title: blogPost.title, keywords: blogPost.tags }}>
      <h1 className="title">{blogPost.title}</h1>
      <div className="subtitle opacity-70">
        <span>
          <FiCalendar className="align-middle" />{' '}
          <span className="align-middle">{moment(blogPost.date).format('DD MMM, yyyy')}</span>
        </span>

        <span className="ml-3">
          <FiClock className="align-middle" />{' '}
          <span className="align-middle">{humanizeTimeToRead(blogPost.timeToReadMins)}</span>
        </span>

        <span className="ml-3">
          <FiTag className="align-middle" />{' '}
          <span className="align-middle">{blogPost.tags.join(', ')}</span>
        </span>
      </div>

      {blogPost.translations && blogPost.translations.length > 0 && (
        <div>
          This article has been translated by readers into:{' '}
          {blogPost.translations.map((translation) => (
            <Link href={translation.url}>{translation.language}</Link>
          ))}
        </div>
      )}

      <article className="content" dangerouslySetInnerHTML={{ __html: blogPost.html }} />
    </Layout>
  );
}
