import hooks from "@demo/frontend/hooks"
import "./styles.less"
import type { FormEvent } from "react"
import lib from "@demo/frontend/lib"

export default function() {
  const wallet = hooks.wallet.useGetWallet()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!wallet) return

    const tokenAddress = e.currentTarget.querySelector<HTMLSelectElement>("select")!.value
    console.log(tokenAddress)

    const result = await lib.permit2.getAllowance(wallet.signer, import.meta.env.VITE_CONTRACT_ADDRESS, tokenAddress)

    console.log(result)
  }

  return (
    <main>
      <form className="permit-form" onSubmit={onSubmit}>
        <div>
          <select>
            <option value="0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0">USDT</option>
            <option value="0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6">DAI</option>
          </select>
        </div>
        <div>
          <button type="submit">
            Allow
          </button>
        </div>
      </form>
    </main>
  )
}
