import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { DashboardLayout } from "~/components/dashboard/DashboardLayout"
import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Button } from "~/components/ui/Button"
import { useGetSite, useUpdateSite } from "~/queries/site"
import Editor from "@monaco-editor/react"
import { FieldLabel } from "~/components/ui/FieldLabel"
import type { ReactElement } from "react"
import { useTranslation } from "next-i18next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/dashboard/DashboardLayout.server"
import { GetServerSideProps } from "next"
import { serverSidePropsHandler } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const { props: layoutProps } = await getLayoutServerSideProps(ctx)

    return {
      props: {
        ...layoutProps,
      },
    }
  },
)

export default function SettingsCSSPage() {
  const router = useRouter()
  const subdomain = router.query.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const { t } = useTranslation("dashboard")

  const [css, setCss] = useState("")
  const handleSubmit = (e: any) => {
    e.preventDefault()
    updateSite.mutate({
      site: subdomain,
      css: css,
    })
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved!")
      } else {
        toast.error("Failed to update site" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to update site")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.isSuccess && site.data && !css && !hasSet) {
      setCss(site.data.css || "")
      setHasSet(true)
    }
  }, [site.data, site.isSuccess, css, hasSet])

  return (
    <SettingsLayout title={"Site Settings"} type="site">
      <form onSubmit={handleSubmit}>
        <div className="">
          <div className="p-5 text-zinc-500 bg-zinc-50 mb-5 rounded-lg text-xs space-y-2">
            <p className="text-zinc-800 text-sm font-bold">{t("Tips")}:</p>
            <p>
              {t(
                "Scope: These styles will be applied to your entire blog, including this dashboard.",
              )}
            </p>
            <p>
              {t("Support")} <code>ipfs://</code>
            </p>
            <p>
              {t("CSS variables: xLog provides some built-in CSS variables")}
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --theme-color: #4f46e5;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --theme-color-emphasis: #4338ca;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --header-height: auto;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --banner-bg-color: #000;
              </span>
            </p>
            <p className="pl-2">
              <span className="bg-zinc-200 rounded-lg px-2">
                --font-fans: ui-sans-serif, system-ui, -apple-system,
                BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto,
                &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;,
                sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI
                Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color
                Emoji&quot;;
              </span>
            </p>
          </div>
          <FieldLabel label={t("Custom CSS")} />
          <Editor
            className="w-full h-96 border outline-none py-3 rounded-lg inline-flex items-center overflow-hidden"
            defaultLanguage="css"
            defaultValue={css}
            onChange={(value) => setCss(value || "")}
            options={{
              fontSize: 14,
            }}
          />
        </div>
        <div className="mt-5">
          <Button type="submit" isLoading={updateSite.isLoading}>
            {t("Save")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

SettingsCSSPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout title="Site Settings">{page}</DashboardLayout>
}
