import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Page from '../components/page'
import utilStyles from '../styles/utils.module.css'
import fetch from 'node-fetch'
import Link from 'next/link'
export default function Home(stars) {
  return (
    <Layout Home={123}>
      <Head>
        <title>First Post {stars.stars}</title>
      </Head>
      {console.log(process.env.NEXT_PUBLIC_DB_HOST)}
      {
        console.log(process.env.some) // getInitialProps的使用方式
      }
      <Page />
      <ul>
        <li>{process.env.NEXT_SERVER_TEST_1}</li>
        <li>{process.env.NEXT_PUBLIC_TEST_1}</li>
        <li>{process.env.NEXT_STATIC_TEST_1}</li>
      </ul>
    </Layout>
  )
}

//server side render 當成是<?PHP ...someprocess ?>
Home.getInitialProps = async (ctx) => {
  const res = await fetch('https://api.github.com/repos/vercel/next.js');
  const json = await res.json();
  //console.log(json);
  return { stars: json.stargazers_count };
}