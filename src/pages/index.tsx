import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
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
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>

          {/* <Link href={`/post/${post.uid}`} key={post.uid}> */}
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida. Pensando em sincronização em vez de ciclos de vida.</p>

            <section>
              <div>
                <FiCalendar size={'1.25rem'} className={styles.icon} />
                <time>06 de março de 2021</time>
              </div>

              <div>
                <FiUser size={'1.25rem'} className={styles.icon} />
                <span>Naoshi Arimori Cyrilli</span>
              </div>
            </section>
          </a>

          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>

            <section>
              <div>
                <FiCalendar size={'1.25rem'} className={styles.icon} />
                <time>06 de março de 2021</time>
              </div>

              <div>
                <FiUser size={'1.25rem'} className={styles.icon} />
                <span>Naoshi Arimori Cyrilli</span>
              </div>
            </section>
          </a>
          {/* </Link> */}
        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
