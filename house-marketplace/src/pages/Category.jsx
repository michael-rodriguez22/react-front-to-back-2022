import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore"
import { db } from "../firebase.config"
import { toast } from "react-toastify"
import Spinner from "../components/Spinner"
import ListingItem from "../components/ListingItem"

function Category() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetchedListing, setLastFetchedListing] = useState(null)

  const params = useParams()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference to collection
        const listingsRef = collection(db, "listings")

        // create a query
        const q = query(
          listingsRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(3)
        )

        // execute query and get snapshot
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach(doc => {
          return listings.push({ id: doc.id, data: doc.data() })
        })

        // determine last visible listing for pagination purposes
        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

        setListings(listings)
        setLoading(false)
      } catch (error) {
        toast.error("Could not fetch listings...")
      }
    }

    fetchListings()
  }, [params.categoryName])

  // pagination / load more listings
  const onFetchMoreListings = async () => {
    try {
      // get reference to collection
      const listingsRef = collection(db, "listings")

      // create a query
      const q = query(
        listingsRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(2)
      )

      // execute query and get snapshot
      const querySnap = await getDocs(q)
      const listings = []
      querySnap.forEach(doc => {
        return listings.push({ id: doc.id, data: doc.data() })
      })

      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)

      setListings(prev => [...prev, ...listings])
      setLoading(false)
    } catch (error) {
      toast.error("Could not fetch listings...")
    }
  }

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Places for {params.categoryName}</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map(listing => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing ? (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More Listings
            </p>
          ) : (
            <p>No More Listings</p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category
