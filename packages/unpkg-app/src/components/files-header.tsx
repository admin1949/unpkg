import { type VNode } from "preact";
import { compare as compareVersions } from "semver";
import { type PackageInfo } from "unpkg-worker";

import { parseGitHubRepo, createGitHubUrl } from "../github.ts";
import { useHrefs } from "../hooks.ts";

import { Hydrate } from "./hydrate.tsx";
import { VersionSelector } from "./version-selector.tsx";
import { GitHubIcon, LinkIcon } from "./icons.tsx";

export function FilesHeader({
  packageInfo,
  version,
  filename,
}: {
  packageInfo: PackageInfo;
  version: string;
  filename: string;
}): VNode {
  let hrefs = useHrefs();

  let availableTags = packageInfo["dist-tags"]!;
  let availableVersions = Object.keys(packageInfo.versions!).sort((a, b) => compareVersions(b, a));
  let pathnameFormat = new URL(hrefs.files(packageInfo.name, "%s", filename)).pathname;

  let packageJson = packageInfo.versions![version];

  let websiteUrl: URL | null = null;
  let websiteText: string | null = null;
  if (packageJson.homepage != null) {
    try {
      websiteUrl = new URL(packageJson.homepage);
      websiteText = websiteUrl.hostname;
      if (websiteUrl.pathname !== "/") {
        websiteText += websiteUrl.pathname;
      }
    } catch (error) {
      // Ignore invalid URLs in package.json "homepage" field
    }
  }

  let githubUrl: URL | null = null;
  let githubText: string | null = null;
  let repository = packageJson.repository;
  if (repository != null && repository.type === "git") {
    let githubRepo = parseGitHubRepo(repository.url);
    if (githubRepo != null) {
      githubUrl = createGitHubUrl(githubRepo);
      githubText = `${githubRepo.owner}/${githubRepo.repo}`;
    }
  }

  return (
    <header class="pt-6 pb-4 lg:pt-16">
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-black text-3xl leading-tight font-semibold">{packageInfo.name}</h1>

        <div class="text-right w-48">
          <span>Version: </span>
          <Hydrate container={<span />}>
            <VersionSelector
              availableTags={availableTags}
              availableVersions={availableVersions}
              currentVersion={version}
              pathnameFormat={pathnameFormat}
              class="w-28 p-1 border border-slate-300 bg-slate-100 text-sm"
            />
          </Hydrate>
        </div>
      </div>

      <div class="mt-2">
        <p class="mb-3 leading-tight">
          <span>{packageJson.description}</span>
        </p>

        <div class="lg:hidden">
          {websiteUrl != null && websiteText != null ? (
            <p class="mt-1 text-sm leading-4">
              <a
                href={websiteUrl.href}
                title={`Visit the ${packageInfo.name} website`}
                class="inline-flex items-center hover:text-slate-950 hover:underline"
              >
                <LinkIcon class="w-6 h-6" />
                <span class="ml-1">{websiteText}</span>
              </a>
            </p>
          ) : null}

          {githubUrl != null && githubText != null ? (
            <p class="mt-1 text-sm leading-4">
              <a
                href={githubUrl.href}
                title={`View the ${packageInfo.name} repository on GitHub`}
                class="inline-flex items-center hover:text-slate-950 hover:underline"
              >
                <GitHubIcon class="w-6 h-6" />
                <span class="ml-1">{githubText}</span>
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
