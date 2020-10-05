import Link from 'next/link'

const Nav = () => {
    return (
        <nav>
            <Link href="/">
                <a>Index</a>
            </Link>
            <Link href="/user/ssg">
                <a>SSG</a>
            </Link>
            <Link href="/user/ssr">
                <a>SSR</a>
            </Link>
            <style jsx>
                {`
          a {
            margin-right: 25px;
          }
        `}
            </style>
        </nav>
    )
}

export default Nav