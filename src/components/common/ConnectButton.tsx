import {
  useConnectModal,
  useAccountState,
  useDisconnectModal,
  GeneralAccount,
  useCsbDetailModal,
  useIsOpSignEnabled,
  useOpSignSettingsModal,
  useUpgradeAccountModal,
  useSelectCharactersModal,
} from "@crossbell/connect-kit"
import { useAccountSites } from "~/queries/site"
import { Avatar } from "~/components/ui/Avatar"
import { Button } from "~/components/ui/Button"
import { DashboardIcon } from "../icons/DashboardIcon"
import { UniLink } from "../ui/UniLink"
import { useEffect, useState } from "react"
import {
  Square2StackIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  CurrencyDollarIcon,
  UsersIcon,
  FaceFrownIcon,
  FaceSmileIcon,
  ArrowUpCircleIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline"
import { BellAlertIcon } from "@heroicons/react/24/solid"
import { SITE_URL } from "~/lib/env"
import { useRefCallback } from "@crossbell/util-hooks"
import {
  useShowNotificationModal,
  useNotifications,
} from "@crossbell/notification"
import { useAccountBalance } from "~/hooks/use-account-balance"
import { Menu } from "~/components/ui/Menu"
import { useTranslation } from "next-i18next"

type HeaderLinkType = {
  icon?: React.ReactNode
  label: string | JSX.Element
  url?: string
  onClick?: () => void
}

export const ConnectButton: React.FC<{
  left?: boolean
  variant?: "text" | "primary" | "secondary" | "like" | "collect" | "crossbell"
  size?: "base" | "sm"
  hideNotification?: boolean
  mobileSimplification?: boolean
  hideName?: boolean
}> = ({
  left,
  variant,
  size = "sm",
  hideNotification,
  mobileSimplification,
  hideName,
}) => {
  let avatarSize
  let sizeDecrease
  switch (size) {
    case "base":
      avatarSize = 40
      sizeDecrease = "sm"
      break
    default:
      avatarSize = 30
      sizeDecrease = "xs"
  }

  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])
  const isOpSignEnabled = useIsOpSignEnabled({
    characterId: account?.characterId,
  })

  const { show: openConnectModal } = useConnectModal()
  const { show: disconnect } = useDisconnectModal()
  const { balance } = useAccountBalance()
  const [copyLabelDisplay, copyLabel] = useCopyLabel(account)
  const csbDetailModal = useCsbDetailModal()
  const opSignSettingsModal = useOpSignSettingsModal()
  const upgradeAccountModal = useUpgradeAccountModal()
  const selectCharactersModal = useSelectCharactersModal()

  const userSites = useAccountSites()

  const showNotificationModal = useShowNotificationModal()
  const { isAllRead } = useNotifications()

  const [InsufficientBalance, setInsufficientBalance] = useState<boolean>(false)
  const { t } = useTranslation("common")

  useEffect(() => {
    if (balance) {
      if (
        BigInt(balance.value.toString()) >
        BigInt("1" + "0".repeat(balance.decimals - 2))
      ) {
        setInsufficientBalance(false)
      } else {
        setInsufficientBalance(true)
      }
    }
  }, [balance])

  const dropdownLinks: HeaderLinkType[] = [
    {
      icon: <DashboardIcon />,
      label: t("Dashboard") || "",
      url: `${SITE_URL}/dashboard`,
    },
    {
      icon: <Square2StackIcon className="w-4 h-4" />,
      label: t(copyLabelDisplay) || "",
      onClick: copyLabel,
    },
    ...(account?.type === "wallet"
      ? [
          {
            icon: <UsersIcon className="w-4 h-4" />,
            label: (
              <>
                {t("Operator Sign")} (
                {isOpSignEnabled ? (
                  <FaceSmileIcon className="w-4 h-4" />
                ) : (
                  <FaceFrownIcon className="w-4 h-4" />
                )}
                )
              </>
            ),
            onClick: () => {
              if (account?.characterId) {
                opSignSettingsModal.show(account?.characterId)
              }
            },
          },
          {
            icon: <CurrencyDollarIcon className="w-4 h-4" />,
            label: (
              <span className={InsufficientBalance ? "text-red-400" : ""}>
                {balance?.formatted.replace(/\.(\d{5})\d*$/, ".$1") ||
                  "0.00000"}{" "}
                CSB
              </span>
            ),
            onClick: csbDetailModal.show,
          },
          {
            icon: <ArrowPathRoundedSquareIcon className="w-4 h-4" />,
            label: t("Switch Characters") || "",
            onClick: selectCharactersModal.show,
          },
        ]
      : [
          {
            icon: <ArrowUpCircleIcon className="w-4 h-4" />,
            label: t("Upgrade to Wallet") || "",
            onClick: upgradeAccountModal.show,
          },
        ]),
    {
      icon: <ArrowRightOnRectangleIcon className="w-4 h-4" />,
      label: t("Disconnect") || "",
      onClick: disconnect,
    },
  ]

  return (
    <div
      {...(!ssrReady && {
        "aria-hidden": true,
        style: {
          opacity: 0,
          pointerEvents: "none",
          userSelect: "none",
        },
      })}
    >
      {(() => {
        if (!account) {
          return (
            <Button
              className="text-accent"
              onClick={openConnectModal}
              style={{ height: avatarSize + "px" }}
              variant={variant || "primary"}
            >
              {t("Connect")}
            </Button>
          )
        }
        return (
          <div
            className="relative flex items-center space-x-2"
            style={{ height: avatarSize + "px" }}
          >
            {userSites.isSuccess ? (
              <>
                {!hideNotification && (
                  <>
                    {isAllRead ? (
                      <BellIcon
                        className={`${
                          size === "base" ? "w-6 h-6" : "w-5 h-5"
                        } text-zinc-500 cursor-pointer sm:hover:animate-buzz-out`}
                        onClick={showNotificationModal}
                      />
                    ) : (
                      <BellAlertIcon
                        className={`${
                          size === "base" ? "w-6 h-6" : "w-5 h-5"
                        } text-accent cursor-pointer sm:hover:animate-buzz-out`}
                        onClick={showNotificationModal}
                      />
                    )}
                    <div className="h-full w-[2px] py-1">
                      <div className="w-full h-full bg-zinc-200 rounded-full"></div>
                    </div>
                  </>
                )}
                <Menu
                  placement="bottom-end"
                  target={
                    <button
                      className="flex items-center w-full space-x-2"
                      type="button"
                      aria-label="connector"
                    >
                      <Avatar
                        className="align-middle"
                        images={userSites.data?.[0]?.avatars || []}
                        name={userSites.data?.[0]?.name}
                        size={avatarSize}
                      />
                      {!hideName && (
                        <div
                          className={`flex-1 flex-col min-w-0 ${
                            mobileSimplification ? "hidden sm:flex" : "flex"
                          }`}
                        >
                          <span
                            className={`text-left leading-none font-medium truncate ${
                              InsufficientBalance
                                ? "text-red-600"
                                : "text-gray-600"
                            } ${size === "base" ? "text-base" : "text-sm"}`}
                            style={{ marginBottom: "0.15rem" }}
                          >
                            {userSites.data?.[0]?.name ||
                              getAccountDisplayName(account)}
                          </span>
                          {userSites.data?.[0]?.username && (
                            <span
                              className={`text-left leading-none ${
                                sizeDecrease === "sm" ? "text-sm" : "text-xs"
                              } truncate ${
                                InsufficientBalance
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {"@" + userSites.data?.[0]?.username ||
                                getAccountDisplayName(account)}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  }
                  dropdown={
                    <div
                      className={`text-gray-600 bg-white rounded-lg ring-1 ring-zinc-100 min-w-[140px] shadow-md py-2 ${
                        size === "base" ? "text-base" : "text-sm"
                      } mt-1`}
                    >
                      {dropdownLinks.map((link, i) => {
                        return (
                          <UniLink
                            key={i}
                            href={link.url}
                            onClick={link.onClick}
                            className={`${
                              size === "base"
                                ? "pl-5 pr-6 h-11"
                                : "pl-4 pr-5 h-9"
                            } flex items-center w-full whitespace-nowrap hover:bg-hover`}
                            aria-label={link.label}
                          >
                            <span className="mr-2 flex justify-center">
                              {link.icon}
                            </span>
                            {link.label}
                          </UniLink>
                        )
                      })}
                    </div>
                  }
                />
              </>
            ) : (
              ""
            )}
          </div>
        )
      })()}
    </div>
  )
}

function useCopyLabel(account: GeneralAccount | null) {
  const [isShowCopied, setIsShowCopied] = useState(false)

  const copyLabel = useRefCallback(() => {
    const value =
      (account?.type === "email" ? account.email : account?.address) || ""

    navigator.clipboard.writeText(value)
    setIsShowCopied(true)
    setTimeout(() => setIsShowCopied(false), 1000)
  })

  return [
    isShowCopied ? "Copied!" : getAccountDisplayName(account),
    copyLabel,
  ] as const
}

function getAccountDisplayName(account: GeneralAccount | null) {
  const value =
    (account?.type === "email" ? account.email : account?.address) || ""

  return value.slice(0, 5) + "..." + value.slice(-4)
}
