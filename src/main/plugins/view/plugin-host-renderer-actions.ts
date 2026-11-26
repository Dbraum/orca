import {
  PLUGIN_VIEW_NO_WORKSPACE_CODE,
  type PluginViewReply,
  type PluginViewRequestBody
} from '../../../shared/plugins/view/plugin-view-protocol'
import type { PluginCommandAliasActionId } from '../../../shared/plugins/contributions/plugin-command-actions'
import { PluginHostCallError } from '../workers/host-api/plugin-host-call-scope'
import type { TuiAgent } from '../../../shared/agent-launch/catalog/tui-agent'
import type { ExecutionHostId } from '../../../shared/execution-host/execution-host'

/** What a worker's `editor.open` and `commands.run` ask of Orca's window. */
export type PluginHostRendererActions = {
  openFile(worktreeId: string, relativePath: string): Promise<void>
  runAction(action: PluginCommandAliasActionId): Promise<void>
  openFolderWorkspace(folderWorkspaceId: string): Promise<void>
  resolveDefaultAgent(
    workspaceId: string,
    repoId: string,
    hostId: ExecutionHostId
  ): Promise<TuiAgent | null>
}

/** Sends one request to the main window's renderer; null when there is no window to ask. */
export type PluginHostRendererRequest = (
  body: PluginViewRequestBody
) => Promise<PluginViewReply> | null

// Set by the desktop app's view binding (Electron stays out of this module); null in headless serve.
let request: PluginHostRendererRequest | null = null

export function setPluginHostRendererRequest(next: PluginHostRendererRequest | null): void {
  request = next
}

async function ask(body: PluginViewRequestBody): Promise<Extract<PluginViewReply, { ok: true }>> {
  const pending = request?.(body) ?? null
  if (!pending) {
    throw new PluginHostCallError('unavailable', 'Orca has no window open to do this in')
  }
  const reply = await pending.catch((error: unknown) => {
    throw new PluginHostCallError(
      'unavailable',
      error instanceof Error ? error.message : String(error)
    )
  })
  if (!reply.ok) {
    const unavailable =
      reply.code === PLUGIN_VIEW_NO_WORKSPACE_CODE || reply.code === 'action_unavailable'
    throw new PluginHostCallError(unavailable ? 'unavailable' : 'action_failed', reply.message)
  }
  return reply
}

export function getPluginHostRendererActions(): PluginHostRendererActions | null {
  return request
    ? {
        openFile: async (worktreeId, relativePath) => {
          await ask({ kind: 'open-file', worktreeId, relativePath })
        },
        runAction: async (action) => {
          await ask({ kind: 'run-action', action })
        },
        openFolderWorkspace: async (folderWorkspaceId) => {
          await ask({ kind: 'open-folder-workspace', folderWorkspaceId })
        },
        resolveDefaultAgent: async (workspaceId, repoId, hostId) => {
          const reply = await ask({ kind: 'resolve-default-agent', workspaceId, repoId, hostId })
          if (reply.defaultAgent === undefined) {
            throw new PluginHostCallError('unavailable', 'Orca could not resolve the default agent')
          }
          return reply.defaultAgent
        }
      }
    : null
}
