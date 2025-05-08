import { redirect } from 'next/navigation'

export default function Home() {
  console.log("oi-- home")
  redirect('/workout')
}
