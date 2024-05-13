import { useEffect, useState } from "react"
import lib from "../lib"

type Web3 = Awaited<ReturnType<typeof lib.wallet.getWallet>>

export const useGetWallet = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null)

  const getWallet = async () => {
    setWeb3(await lib.wallet.getWallet())
  }

  useEffect(() => {
    getWallet()
  }, [])

  return web3
}
