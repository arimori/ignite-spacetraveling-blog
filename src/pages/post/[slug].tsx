import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback || !post) {
    return <p>Carregando...</p>;
  }

  const totalWords = RichText.asText(
    post.data.content.reduce((acc, item) =>
      [...acc, ...item.body], [])
  ).split(' ').length;

  const readingAverageTime = Math.ceil(totalWords / 200); //200 = average reading time per minute

  return (
    <>
      <Head>
        <title> {post?.data.title ?? 'Carregando...'} | SpaceTraveling</title>
      </Head>

      <Header />

      <main className={styles.container}>
        <img
          className={styles.banner}
          src={post.data.banner.url}
          alt={post.data.title}
        />
        <article className={styles.post}>
          <header>
            <h1>{post.data.title}</h1>

            <section>
              <div>
                <FiCalendar size={'1.25rem'} />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM yyyy",
                    { locale: ptBR }
                  )}
                </time>
              </div>

              <div>
                <FiUser size={'1.25rem'} />
                <span>{post.data.author}</span>
              </div>

              <div>
                <FiClock size={'1.25rem'} />
                <span>{readingAverageTime} min</span>
              </div>
            </section>
          </header>

          <div className={styles.content}>
            {post.data.content.map(item => {
              return (
                <div key={post.uid}>
                  <strong>{item.heading}</strong>
                  {item.body.map(item => (
                    <div
                      className={styles.contentBody}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  ))}

                </div>
              )
            })}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'publication')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publication', String(slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(item => {
        return {
          heading: item.heading,
          body: [...item.body],
        }
      }),
    },
  };

  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutes
  }
};
