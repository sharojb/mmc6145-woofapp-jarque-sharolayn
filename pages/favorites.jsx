import Head from "next/head";
import Link from 'next/link';
import styles from "../styles/Favorites.module.css";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import Header from "../components/header";
import DogList from "../components/dogList";
import db from "../db";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    let dogs
    if (user)
      dogs = await db.dog.getAll(user.id)
    if (!dogs) {
      req.session.destroy()
      return {
        redirect: {
          destination: '/login',
          permanent: false
        }
      }
    }
    return {
      props: {
        user: req.session.user,
        isLoggedIn: true,
        favoriteDogs: dogs,
      }
    };
  },
  sessionOptions
);

export default function Favorites(props) {
  return (
    <>
      <Head>
        <title>Woof Favorites</title>
        <meta name="description" content="Your favorite dogs on Woof" />
      </Head>

      <Header isLoggedIn={props.isLoggedIn} />

      <main>
        <h1 className={styles.title}>Favorite Dogs</h1>
        {props.favoriteDogs.length > 0 ? <DogList dogs={props.favoriteDogs} /> : <NoDogText />}
      </main>
    </>
  );
}

function NoDogText() {
  return (
    <div className={styles.noDogs}>
      <p><strong>You don't have any dogs saved to your favorites.</strong></p>
      <p>Why don't you <Link href="/">go sniff</Link> and add some?</p>
    </div>
  )
}