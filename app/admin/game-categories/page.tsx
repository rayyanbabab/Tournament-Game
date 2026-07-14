import { getGameConfigs } from '@/app/actions/game-config'
import GameCategoriesClient from './client'

export default async function GameCategoriesPage() {
  const games = await getGameConfigs()
  return <GameCategoriesClient initial={games} />
}
