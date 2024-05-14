import hooks from "@demo/frontend/hooks"
import "./styles.less"
import { useState, type FormEvent, type FunctionComponent } from "react"
import lib from "@demo/frontend/lib"
import type { Wallet } from "@demo/frontend/types"

const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_CONTRACT_ADDRESS
const DAI_TOKEN_ADDRESS = import.meta.env.VITE_DAI_CONTRACT_ADDRESS
const SPENDER_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

const PermitForm: FunctionComponent<{
  wallet: Wallet
  setTokenAddress: (addr: string) => void
}> = ({ wallet, setTokenAddress }) => {
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const tokenAddress = e.currentTarget.querySelector<HTMLSelectElement>("select")!.selectedOptions[0].value

    const tx = await lib.permit2.authorize(wallet, tokenAddress)
    console.log(await tx.wait())

    setTokenAddress(tokenAddress)
  }

  return (
    <form className="form permit-form" onSubmit={onSubmit}>
      <div>
        <select>
          <option value={USDT_TOKEN_ADDRESS}>USDT</option>
          <option value={DAI_TOKEN_ADDRESS}>DAI</option>
        </select>
      </div>
      <div>
        <button type="submit">
          Permit
        </button>
      </div>
    </form>
  )
}

const TransferForm: FunctionComponent<{
  wallet: Wallet
  tokenAddress: string
}> = ({ wallet, tokenAddress }) => {
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const tx = await lib.permit2.handlePermit(wallet, tokenAddress, SPENDER_ADDRESS)
    console.log(await tx.wait())
  }

  return (
    <form className="form transfer-form" onSubmit={onSubmit}>
      <div>
        <button type="submit">
          Transfer
        </button>
      </div>
    </form>
  )
}

export default function() {
  const [tokenAddress, setTokenAddress] = useState(USDT_TOKEN_ADDRESS)
  const wallet = hooks.wallet.useGetWallet()

  if (!wallet)
    return null

  return (
    <main>
      <PermitForm wallet={wallet} setTokenAddress={setTokenAddress} />
      <TransferForm wallet={wallet} tokenAddress={tokenAddress} />
    </main>
  )
}
