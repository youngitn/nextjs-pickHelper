import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

const name = 'Your Name'
export const siteTitle = 'Next.js Sample Website'

export default function Layout({ children }) {
    


    return (
        <div className={styles.container}>
            <Head>
           <link rel="icon" href="/favicon1.ico" />
                
            </Head>
            
            <main> {children}</main>
            
        </div>
    )
}