import { useRouter } from 'next/router'

import { useTranslation } from 'src/languages/components/useTranslation'
import { DEFAULT_VERSION, useVersion } from 'src/versions/components/useVersion'
import { Link } from 'src/frame/components/Link'
import { ProgAccessT } from './types'

// Documentation paths may be moved around by content team in the future
const USER_TOKEN_PATH =
  '/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app'
const INSTALLATION_TOKEN_PATH =
  '/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app'
const FINE_GRAINED_TOKEN_PATH =
  '/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token'

type Props = {
  progAccess: ProgAccessT
  slug: string
  heading: string
}

export function RestAuth({ progAccess, slug, heading }: Props) {
  const router = useRouter()
  const { currentVersion } = useVersion()
  const { t } = useTranslation('rest_reference')

  // This early return can be removed once GHES 3.9 is deprecated
  // The GHES 3.8 and 3.9 releases don't support fine-grained access tokens
  if (currentVersion === 'enterprise-server@3.9' || currentVersion === 'enterprise-server@3.8')
    return null

  let basePath = `/${router.locale}`
  if (currentVersion !== DEFAULT_VERSION) {
    basePath += `/${currentVersion}`
  }

  // There are some operations that have no progAccess access defined
  // For those operations, we shouldn't display this component
  if (!progAccess) return null
  const { userToServerRest, serverToServer, fineGrainedPat } = progAccess
  const noFineGrainedAcccess = !(userToServerRest || serverToServer || fineGrainedPat)

  // Pluralize the message if needed or customize it
  // when no permissions are defined
  const numPermissionSets = progAccess.permissions.length
  const permissionMsg =
    numPermissionSets === 0
      ? t('no_permission_sets')
      : numPermissionSets > 1
        ? t('permission_sets') + ':'
        : t('permission_set') + ':'
  const publicAccessMsg =
    numPermissionSets === 0
      ? t('allows_public_read_access_no_permissions')
      : t('allows_public_read_access')
  // progAccess.permissions is an array of objects
  // For example: [ {'actions': 'read', 'packages': 'read'}, {'read': 'repo'} ]
  // Each object represents a set of permissions containing one
  // or more key-value pairs. All permissions in a set are required.
  // If there is more than one set of permissions, any set can be used.
  const formattedPermissions = progAccess.permissions.map((permissionSet: Object, index) => {
    // Given the example above, the first object is now an array of tuples
    // [['actions', 'read'], ['packages', 'read']]
    // that can be formatted as a string like `actions:read` and `packages:read`
    const permissionSetPairs = Object.entries(permissionSet)
    const numPermissionSetPairs = permissionSetPairs.length

    return (
      <li key={`token-permissions-${index}`}>
        {permissionSetPairs.map(([key, value], setIndex) => (
          <span key={`token-permissions-text-${index}-${setIndex}`}>
            <code>{key + ':' + value}</code>
            {setIndex < numPermissionSetPairs - 1 && <span> and </span>}
          </span>
        ))}
      </li>
    )
  })

  const fineGrainedData = (
    <>
      <p>{t('works_with_tokens')}:</p>
      <ul>
        {progAccess.userToServerRest && (
          <li>
            <Link href={`${basePath}${USER_TOKEN_PATH}`}>{t('user_access_token_name')}</Link>
          </li>
        )}
        {progAccess.serverToServer && (
          <li>
            <Link href={`${basePath}${INSTALLATION_TOKEN_PATH}`}>
              {t('installation_access_token_name')}
            </Link>
          </li>
        )}
        {progAccess.fineGrainedPat && (
          <li>
            <Link href={`${basePath}${FINE_GRAINED_TOKEN_PATH}`}>
              {t('fine_grained_access_token_name')}
            </Link>
          </li>
        )}
      </ul>
      <p>{permissionMsg}</p>
      {formattedPermissions.length > 0 && <ul>{formattedPermissions}</ul>}
      {progAccess.allowsPublicRead && <p>{publicAccessMsg}</p>}
    </>
  )

  return (
    <>
      <h3 className="mt-4 mb-3 pt-3 h4" id={`${slug}--fine-grained-access-tokens`}>
        <a href={`#${slug}--fine-grained-access-tokens`}>{heading}</a>
      </h3>
      {noFineGrainedAcccess ? <p>{t('no_fine_grained_access')}</p> : fineGrainedData}
    </>
  )
}
