import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date_formatted: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  next_page: string;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMorePosts() {
    const { results } = await fetch(nextPage)
      .then(response => response.json());

    const newPosts = results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        first_publication_date_formatted: format(
          new Date(post.first_publication_date),
          "dd MMM yyyy",
          { locale: ptBR }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    });

    setPosts([...posts, ...newPosts]);
    setNextPage(results.data?.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <section>
                  <div>
                    <FiCalendar size={'1.25rem'}/>
                    <time>{post.first_publication_date_formatted}</time>
                  </div>

                  <div>
                    <FiUser size={'1.25rem'} />
                    <span>{post.data.author}</span>
                  </div>
                </section>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              type="button"
              className={styles.loadPosts}
              onClick={() => handleLoadMorePosts()}
            >
              Carregar mais posts
            </button>
          )}

        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.subtitle', 'publication.author'],
    pageSize: 2,
  });

  const results = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      first_publication_date_formatted: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        { locale: ptBR }
      ),
      data: {
        title: post.data.title,
        subtitle: post?.data.subtitle,
        author: post.data.author,
      }
    }
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: response.next_page
      }
    }
  }
};
