# Putting BasketCheck online for $0

A beginner's guide. Takes about 30 minutes the first time. You need: this project folder (`waterloo-basket-check`), an email address, and a web browser.

## Which free host, and the site name

**Best fit: Cloudflare Pages.** BasketCheck is plain files (HTML, CSS, JavaScript, data) with no server, no database and no build step, which is exactly what Cloudflare Pages hosts for free. It gives the site its own name (`your-name.pages.dev`), turns on HTTPS by itself, and when it is connected to GitHub it republishes the site every time you upload a change. GitHub also shows your code, which helps on a resume.

**Runner-up: GitHub Pages.** Just as free and simple, but the address is tied to your GitHub username (`username.github.io/basketcheck-waterloo`) instead of a name of its own.

**Site name chosen: `basketcheck-waterloo`**, so the address is **https://basketcheck-waterloo.pages.dev**. It says what the site is and where it works. If that name is taken, Cloudflare adds a few random letters; use `basketcheck-kw` instead.

**Free-tier limits that could matter** (from the hosts' own pages, checked Nov 18, 2026):
- Cloudflare Pages free: 500 builds a month, 20,000 files per site, 25 MiB per file, 100 projects per account. BasketCheck has about 60 files and the largest is under 2 MB, so none of these come close. Its limits page lists no bandwidth cap for plain files.
- GitHub Pages: the site must be under 1 GB, a "soft" limit of 100 GB of traffic a month, and on a free account the repository has to be public.
- Netlify (not chosen): the free plan now works on 300 credits a month, and each production deploy costs 15 credits plus traffic, so with weekly price updates it could run out.

## Part 1: Put the code on GitHub (10 minutes)

1. Go to https://github.com/signup and make a free account. Choose a professional username: it will show on your resume link.
2. Top right, press **+**, then **New repository**.
   - Repository name: `basketcheck-waterloo`
   - Description: `Compare a grocery cart across six chains in Waterloo Region`
   - Choose **Public**, and leave "Add a README" unticked (the project already has one).
   - Press **Create repository**.
3. On the next page, click the link **uploading an existing file**.
4. Open the `waterloo-basket-check` folder on your Mac, select **everything inside it** (Cmd+A), and drag it onto the page. `index.html` must sit at the top level, not inside another folder. If hidden items like `.vscode` don't come along, that's fine.
5. Wait for the files to finish uploading, then press **Commit changes**.

## Part 2: Publish it with Cloudflare Pages (10 minutes)

1. Go to https://dash.cloudflare.com/sign-up and make a free account (confirm your email).
2. In the left menu open **Workers & Pages** (it may be under **Compute**), press **Create**, then the **Pages** tab, then **Connect to Git** (sometimes **Import an existing Git repository**).
3. Press **Connect GitHub**, sign in, and allow Cloudflare to see **only the `basketcheck-waterloo` repository**.
4. Pick the repository and press **Begin setup**.
   - Project name: `basketcheck-waterloo` (this becomes the address).
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: leave **empty**
   - Build output directory: `/` (the top of the repository)
5. Press **Save and Deploy**. After about a minute it shows **Success** and the link **https://basketcheck-waterloo.pages.dev**. Open it.

**Environment variables and secrets:** none. BasketCheck has no passwords or API keys. The address search (Esri, with Photon as backup), the street map tiles (Esri) and the route times (OpenStreetMap routing) are public services the browser calls directly. Leave the environment variables section empty.

**HTTPS:** automatic. The `pages.dev` address has a padlock from the first minute, with nothing to set up.

## Part 3: Check it works (5 minutes)

On the live link, on your computer and on your phone:
- Type an address in "Where are you starting?" and pick a suggestion. (This only works on the real site, not in the Claude preview.)
- The street map shows behind the store dots.
- The results line says "(real routes from OpenStreetMap)" for walk, bike or car.
- Copy a share link from "Share with roommates", open it on your phone, and check the same cart appears.

## Part 4: Updating the site later

Whenever Claude gives you a new zip (for example after the weekly price refresh):
1. Unzip it.
2. On GitHub, open the `basketcheck-waterloo` repository, press **Add file**, then **Upload files**.
3. Drag in everything inside the new `waterloo-basket-check` folder. Files with the same name are replaced.
4. Press **Commit changes**. Cloudflare sees the change and republishes within about a minute.

If you'd like this fully automatic later, Claude can push the weekly update to the GitHub repository itself once you connect GitHub to the project.

## Pre-launch checklist

- [ ] Contact email added to the Privacy and Terms pages (they currently say one will be added before the site is shared).
- [ ] GRT bus and ION times added, or the "Bus / ION" option clearly left as an estimate (it already says "(estimated)").
- [ ] Prices checked recently: the date range in the grey bar at the top of every page is no more than a couple of weeks old.
- [ ] Opened the live link on your own iPhone in Safari and tapped through: add items, a meal starter, checkout, pick a residence, open a receipt, save a cart, share link.
- [ ] Address search, street map and real route times work on the live link.
- [ ] Footer links (Help, Privacy, Terms) open the right pages.
- [ ] Shared the link with two or three friends first and fixed what confused them.

## Later: your own domain name

A custom address like `basketcheck.ca` costs only the domain itself, roughly $15 to $30 CAD a year for a `.ca` or `.com` (an estimate; check the current price at Cloudflare Registrar, Namecheap or a Canadian registrar before buying). Hosting stays free, and Cloudflare Pages connects a custom domain and its HTTPS certificate at no extra cost (up to 100 domains per project on the free plan). A `.ca` needs you to be Canadian or have a Canadian presence.
