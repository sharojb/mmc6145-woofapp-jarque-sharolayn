import { withIronSessionSsr } from "iron-session/next";
import Head from "next/head";
import sessionOptions from "../config/session";
import { useDogContext } from "../context/dog";
import DogList from "../components/dogList";
import Header from '../components/header'
import * as actions from '../context/dog/actions'
import { useState, useRef } from 'react'
import styles from '../styles/Search.module.css'

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const { user } = req.session;
    const props = {};
    if (user) {
      props.user = req.session.user;
    }
    props.isLoggedIn = !!user;
    return { props };
  },
  sessionOptions
);

export default function Search(props) {
  const [{dogSearchResults}, dispatch] = useDogContext()
  const [query, setQuery] = useState("")
  const [fetching, setFetching] = useState(false)
  const [previousQuery, setPreviousQuery] = useState()
  const inputRef = useRef()
  const inputDivRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    if (fetching || !query.trim() || query === previousQuery) return
    setPreviousQuery(query)
    setFetching(true)
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?langRestrict=en&q=${query}&maxResults=16`
    )
    if (res.status !== 200) return
    const data = await res.json()
    dispatch({
      action: actions.SEARCH_DOGS,
      payload: data
        ?.items
        ?.map(({id, volumeInfo}) => ({
          ...volumeInfo,
          googleId: id,
          thumbnail: volumeInfo?.imageLinks?.thumbnail
        }))
    })
    setFetching(false)
  }

  return (
    <>
      <Head>
        <title>Dog Search</title>
        <meta name="description" content="The Woof Search Page" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22></text></svg>" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <Header isLoggedIn={props.isLoggedIn} />
      <main>
        <h1 className={styles.title}>Dog Search</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="dog-search">Search by name, height, and/or keywords:</label>
          <div ref={inputDivRef}>
            <input
              ref={inputRef}
              type="text"
              name="dog-search"
              id="dog-search"
              value={query}
              autoFocus={true}
              onChange={e => setQuery(e.target.value)}/>
            <button type="submit">Submit</button>
          </div>
        </form>
        {
          fetching
          ? <Loading />
          : dogSearchResults?.length
          ? <DogList dogs={dogSearchResults}/>
          : <NoResults
          {...{inputRef, inputDivRef, previousQuery}}
          clearSearch={() => setQuery("")}/>
        }
      </main>
    </>
  )
}

function Loading() {
  return <span className={styles.loading}>Still sniffing</span>
}

function NoResults({ inputDivRef, inputRef, previousQuery, clearSearch }) {
  function handleLetsSearchClick() {
    inputRef.current.focus()
    if (previousQuery) clearSearch()
    if (inputDivRef.current.classList.contains(styles.starBounce)) return
    inputDivRef.current.classList.add(styles.starBounce)
    inputDivRef.current.onanimationend = function () {
      inputDivRef.current.classList.remove(styles.starBounce)
    }
  }
  return (
    <div className={styles.noResults}>
      <p><strong>{previousQuery ? `No Dogs found for "${previousQuery}"` : "Nothing to sniff yet"}</strong></p>
      <button onClick={handleLetsSearchClick}>
        {
          previousQuery
          ? `Sniff again?`
          : `Let's find a dog!`
        }
      </button>
    </div>
  )
}