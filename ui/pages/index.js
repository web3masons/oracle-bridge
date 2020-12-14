import Head from 'next/head';
import Bridge from '../components/Bridge';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <>
      <Head>
        <title>Oracle Bridge Demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Bridge />
      </Layout>
    </>
  );
}
