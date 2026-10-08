import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Command,
  Compass,
  ExternalLink,
  Filter,
  Layers3,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { popularRoles, roles, type Category, type Resource, type Role } from "./data";
import "./App.css";
import "./roadmap.css";
import "./matcher.css";
import "./portal.css";
import "./typography.css";
import "./career-finder.css";
import { PWAStatus } from "./PWAStatus";

type View = "home" | "explore" | "about" | "role";
const iconMap = {
  "Software Development": Code2,
  "Data & AI": Zap,
  Cybersecurity: ShieldCheck,
  "Cloud & DevOps": Terminal,
  "Systems & Data": BookOpen,
  "Design & Product": Sparkles,
  Testing: Check,
};
const categoryLabels = [
  "All",
  "Software Development",
  "Data & AI",
  "Cybersecurity",
  "Cloud & DevOps",
  "Design & Product",
  "Testing",
];
const roleSearchText = (role: Role) => [role.title, role.category, role.description, ...role.technologies, ...role.learningOrder, ...role.skills.flatMap((group) => group.items)].join(" ").toLowerCase();

function App() {
  const [view, setView] = useState<View>("home");
  const [selectedSlug, setSelectedSlug] = useState("data-scientist");
  const [focusProjectId, setFocusProjectId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("roleready-theme") !== "light");
  const [menu, setMenu] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [matcherOpen, setMatcherOpen] = useState(false);
  const navigate = (next: View, slug?: string, projectId?: string) => {
    setView(next);
    if (slug) setSelectedSlug(slug);
    setFocusProjectId(projectId ?? null);
    setMenu(false);
    setPaletteOpen(false);
    setMatcherOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("roleready-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const role = roles.find((item) => item.slug === selectedSlug);
    document.title = view === "role" && role ? `${role.title} Roadmap — Skills, Resources & Projects | RoleReady` : view === "explore" ? "Explore Career Roles | RoleReady" : "RoleReady — Career Roadmaps for Students";
    document.querySelector('meta[name="description"]')?.setAttribute("content", role && view === "role" ? `${role.title} skills, roadmap, resources, projects and career progression.` : "Discover the skills, learning roadmap, resources and projects needed to become job-ready.");
  }, [selectedSlug, view]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const selected = roles.find((role) => role.slug === selectedSlug) ?? roles[0];
  return (
    <div className="app-shell">
      <header className="nav">
        <button className="brand" onClick={() => navigate("home")}>
          <span className="brand-mark">
            <Compass size={17} />
          </span>
          <span>
            Role<span className="brand-accent">Ready</span>
          </span>
        </button>
        <button
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle menu"
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav className={menu ? "nav-links open" : "nav-links"}>
          <button
            className={view === "home" ? "active" : ""}
            onClick={() => navigate("home")}
          >
            Home
          </button>
          <button
            className={view === "explore" ? "active" : ""}
            onClick={() => navigate("explore")}
          >
            Explore roles
          </button>
          <button onClick={() => navigate("role", "data-scientist")}>
            Roadmaps
          </button>
          <button
            className={view === "about" ? "active" : ""}
            onClick={() => navigate("about")}
          >
            About
          </button>
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button"
            aria-label="Toggle theme"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="nav-search" onClick={() => setPaletteOpen(true)}>
            <Search size={15} />
            <span>Find a role</span>
            <kbd>
              <Command size={11} /> K
            </kbd>
          </button>
        </div>
      </header>
      {view === "home" && (
        <Home
          navigate={navigate}
          query={query}
          setQuery={setQuery}
          openPalette={() => setPaletteOpen(true)}
          openMatcher={() => setMatcherOpen(true)}
        />
      )}{" "}
      {view === "explore" && (
        <Explore navigate={navigate} query={query} setQuery={setQuery} />
      )}{" "}
      {view === "role" && <RolePage role={selected} navigate={navigate} focusProjectId={focusProjectId} />}{" "}
      {view === "about" && <About navigate={navigate} />}
      <Footer navigate={navigate} />
      <PWAStatus />
      {matcherOpen && <CareerMatcher close={() => setMatcherOpen(false)} navigate={navigate} />}
      {paletteOpen && (
        <CommandPalette
          close={() => setPaletteOpen(false)}
          navigate={navigate}
          query={query}
          setQuery={setQuery}
        />
      )}
    </div>
  );
}

function SearchBox({
  query,
  setQuery,
  navigate,
  openPalette,
}: {
  query: string;
  setQuery: (v: string) => void;
  navigate: (v: View, slug?: string) => void;
  openPalette?: () => void;
}) {
  const suggestions = query
    ? roles
        .filter((role) => roleSearchText(role).includes(query.toLowerCase()))
        .slice(0, 5)
    : [];
  return (
    <div className="search-wrap" onClick={openPalette}>
      <Search size={20} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={openPalette}
        placeholder="Search for a job role..."
        onKeyDown={(event) =>
          event.key === "Enter" &&
          suggestions[0] &&
          navigate("role", suggestions[0].slug)
        }
      />
      <kbd>
        <Command size={11} /> K
      </kbd>
      {query && (
        <button
          className="clear-search"
          onClick={(event) => {
            event.stopPropagation();
            setQuery("");
          }}
        >
          <X size={15} />
        </button>
      )}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((role) => (
            <button key={role.slug} onClick={() => navigate("role", role.slug)}>
              <span>{role.title}</span>
              <small>{role.category}</small>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Home({
  navigate,
  query,
  setQuery,
  openPalette,
  openMatcher,
}: {
  navigate: (v: View, slug?: string) => void;
  query: string;
  setQuery: (v: string) => void;
  openPalette: () => void;
  openMatcher: () => void;
}) {
  const featured = [
    "Data Scientist",
    "AI Engineer",
    "Software Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Cybersecurity Analyst",
    "Cloud Engineer",
    "Machine Learning Engineer",
  ]
    .map((title) => roles.find((role) => role.title === title))
    .filter(Boolean) as Role[];
  return (
    <main>
      <section className="hero section">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Your career, mapped clearly
          </div>
          <h1>
            Choose Your Role.
            <br />
            Follow the <em>Path.</em>
            <br />
            Build Your Career.
          </h1>
          <p className="hero-lede">
            RoleReady turns your career goal into a structured roadmap of skills,
            resources, and real-world projects.
          </p>
          <div className="hero-search">
            <label>What role are you interested in?</label>
            <SearchBox
              query={query}
              setQuery={setQuery}
              navigate={navigate}
              openPalette={openPalette}
            />
            <div className="search-hints">
              <span>Popular:</span>
              <button onClick={() => navigate("role", "data-scientist")}>
                Data Scientist
              </button>
              <button onClick={() => navigate("role", "ai-engineer")}>
                AI Engineer
              </button>
              <button onClick={() => navigate("role", "cybersecurity-analyst")}>
                Cybersecurity Analyst
              </button>
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("explore")}>
              Explore Career Roles <ArrowRight size={17} />
            </button>
            <button className="secondary-button" onClick={openMatcher}>
              Find My Career Path <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <RoadmapPreview />
      </section>
      <section className="value-strip">
        <div className="value-intro">
          Everything you need to move from <b>“I want this job”</b> to{" "}
          <b>“I know what to learn next.”</b>
        </div>
        {[
          ["01", "Know the skills", "See the toolkit behind the title", Code2],
          [
            "02",
            "Follow the roadmap",
            "Learn prerequisites in sequence",
            Layers3,
          ],
          ["03", "Build your proof", "Turn knowledge into projects", Sparkles],
        ].map(([number, title, copy, Icon]) => (
          <div className="value-item" key={title as string}>
            <span>{number as string}</span>
            <Icon size={18} />
            <div>
              <b>{title as string}</b>
              <small>{copy as string}</small>
            </div>
          </div>
        ))}
      </section>
      <section className="section popular">
        <SectionHeading
          eyebrow="THE SHORTLIST"
          title="Explore popular career paths"
          copy="Not sure where to start? Explore the roles students are building toward."
          action="Browse all roles"
          onClick={() => navigate("explore")}
        />
        <div className="role-grid featured-grid">
          {featured.map((role) => (
            <RoleCard key={role.slug} role={role} navigate={navigate} />
          ))}
        </div>
      </section>
      <section className="section categories-section">
        <SectionHeading
          eyebrow="FIND YOUR CORNER OF TECH"
          title="Explore by category"
          copy="Different paths, same promise: a clearer next step."
        />
        <div className="category-tabs">
          {categoryLabels.map((category) => (
            <button
              key={category}
              onClick={() => { setQuery(category === "All" ? "" : category === "AI & Data" ? "Data & AI" : category); navigate("explore"); }}
              className={category === "All" ? "active" : ""}
            >
              {category === "Software Development"
                ? "Software"
                : category === "Design & Product"
                  ? "Design"
                  : category} <small>{category === "All" ? roles.length : roles.filter((role) => role.category === category).length}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="section method-section">
        <div className="method-intro">
          <div className="eyebrow">THE ROLE READY METHOD</div>
          <h2>
            From job title
            <br />
            to <em>learning path.</em>
          </h2>
          <p>
            Career advice gets noisy fast. We turn it into one calm, considered
            sequence of next steps.
          </p>
        </div>
        <div className="method-steps">
          {[
            [
              "01",
              "Choose your role",
              "Tell RoleReady what career you are targeting.",
            ],
            [
              "02",
              "See your roadmap",
              "Understand the skills and technologies you need to learn.",
            ],
            [
              "03",
              "Start learning",
              "Access curated resources and build relevant projects.",
            ],
          ].map(([number, title, copy], index) => (
            <div className="method-step" key={number}>
              <span className="step-number">{number}</span>
              <span className="step-line" />
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              {index < 2 && <ArrowRight className="step-arrow" size={17} />}
            </div>
          ))}
        </div>
      </section>
      <RoadmapSection navigate={navigate} />
      <ResourceShowcase />
      <ProjectShowcase navigate={navigate} />
      <section className="cta-section">
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER</div>
          <h2>
            Your next career step
            <br />
            is closer than <em>you think.</em>
          </h2>
          <p>Choose a role. Follow the roadmap. Start building.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("explore")}>
          Explore job roles <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}

function RoadmapPreview() {
  const steps = [
    "Python",
    "SQL",
    "Statistics",
    "Data Analysis",
    "Machine Learning",
    "Projects",
  ];
  return (
    <div className="roadmap-preview-wrap">
      <div className="float-card float-skills">
        <b>42</b>
        <span>skills mapped</span>
      </div>
      <div className="float-card float-resources">
        <b>18</b>
        <span>resources</span>
      </div>
      <div className="roadmap-preview">
        <div className="preview-top">
          <div>
            <span className="preview-label">DATA & AI / ROADMAP</span>
            <h3>Data Scientist</h3>
          </div>
          <span className="preview-status">
            <Check size={12} /> In demand
          </span>
        </div>
        <div className="preview-body">
          <span className="preview-axis" />
          {steps.map((step, index) => (
            <div className="preview-step" key={step}>
              <span
                className={index === 0 ? "preview-dot current" : "preview-dot"}
              >
                {index === 0 && <Check size={11} />}
              </span>
              <div>
                <small>0{index + 1}</small>
                <b>{step}</b>
              </div>
            </div>
          ))}
        </div>
        <div className="preview-footer">
          <span>
            <Clock3 size={13} /> 16–20 weeks
          </span>
          <span>
            6 stages <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
  onClick,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
function RoleCard({
  role,
  navigate,
}: {
  role: Role;
  navigate: (v: View, slug?: string) => void;
}) {
  const Icon = iconMap[role.category];
  return (
    <button
      className="role-card"
      onClick={() => navigate("role", role.slug)}
      style={{ "--role-accent": role.accent } as React.CSSProperties}
    >
      <div className="card-top">
        <span className="role-icon">
          <Icon size={18} />
        </span>
        <span className="difficulty">{role.difficulty}</span>
      </div>
      <h3>{role.title}</h3>
      <p>{role.description.split(". ")[0]}.</p>
      <div className="card-bottom">
        <span>
          {role.stages.length} stages ·{" "}
          {role.skills.reduce((total, skill) => total + skill.items.length, 0) +
            30}{" "}
          skills
        </span>
        <ArrowUpRight size={16} />
      </div>
    </button>
  );
}
function RoadmapSection({
  navigate,
}: {
  navigate: (v: View, slug?: string) => void;
}) {
  const steps = [
    "Python",
    "Statistics",
    "SQL & Data Analysis",
    "Machine Learning",
    "Advanced ML",
    "Projects",
  ];
  return (
    <section className="roadmap-showcase">
      <div className="section roadmap-showcase-inner">
        <div className="roadmap-copy">
          <div className="eyebrow">A GLIMPSE OF THE PATH</div>
          <h2>
            Know exactly
            <br />
            what to learn <em>next.</em>
          </h2>
          <p>
            Good roadmaps remove the guesswork. Start with foundations, build
            confidence, then make something real.
          </p>
          <button
            className="primary-button"
            onClick={() => navigate("role", "data-scientist")}
          >
            Explore this roadmap <ArrowRight size={17} />
          </button>
        </div>
        <div className="large-roadmap-card">
          <div className="roadmap-card-head">
            <div>
              <span className="eyebrow">DATA & AI</span>
              <h3>Data Scientist</h3>
            </div>
          </div>
          {steps.map((step, index) => (
            <div className="large-step" key={step}>
              <span className="large-step-number">0{index + 1}</span>
              <span className="large-step-line" />
              <div>
                <b>{step}</b>
                <small>
                  {index === 0
                    ? "The language of your toolkit"
                    : index === 5
                      ? "Turn learning into proof"
                      : "Build the next layer of fluency"}
                </small>
              </div>
              <ArrowRight size={15} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function ResourceShowcase() {
  const resources: [string, string, string, string, typeof BookOpen, string][] = [
    [
      "Video",
      "Python for Beginners",
      "freeCodeCamp",
      "Start with the language that powers your analysis.",
      Code2,
      "https://docs.python.org/3/tutorial/",
    ],
    [
      "Course",
      "Data Analysis with Python",
      "freeCodeCamp",
      "Move from syntax into useful, practical analysis.",
      BookOpen,
      "https://www.freecodecamp.org/learn/data-analysis-with-python/",
    ],
    [
      "Documentation",
      "Python documentation",
      "Python.org",
      "Keep the source of truth close as you learn.",
      BookOpen,
      "https://developer.mozilla.org/en-US/docs/Learn",
    ],
    [
      "Practice",
      "Python track",
      "Exercism",
      "Build fluency through small, focused exercises.",
      Zap,
      "https://exercism.org/tracks/python",
    ],
  ];
  return (
    <section className="section resource-section">
      <SectionHeading
        eyebrow="CURATED, NOT CROWDED"
        title="Learn from resources that actually help."
        copy="Every roadmap stage comes with carefully selected resources so you can spend less time searching and more time learning."
      />
      <div className="resource-grid">
        {resources.map(([type, title, provider, copy, Icon, url]) => (
          <a
            className={`resource-card resource-${type.toLowerCase()}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            key={type}
          >
            <div className="resource-card-top">
              <span>
                <Icon size={17} /> {type}
              </span>
              <ExternalLink size={14} />
            </div>
            <h3>{title}</h3>
            <small>{provider}</small>
            <p>{copy}</p>
            <b className="resource-link">
              Open resource <ArrowUpRight size={14} />
            </b>
          </a>
        ))}
      </div>
    </section>
  );
}
function ProjectShowcase({ navigate }: { navigate: (v: View, slug?: string) => void }) {
  return (
    <section className="section project-showcase">
      <div className="section-heading">
        <div>
          <div className="eyebrow">BUILD YOUR PROOF</div>
          <h2>
            Don’t just learn. <em>Build.</em>
          </h2>
          <p>
            Projects turn a roadmap into something you can show, discuss, and be
            proud of.
          </p>
        </div>
      </div>
      <div className="project-grid showcase-projects">
        {[
          [
            "Beginner",
            "Student Performance Analyzer",
            "Python · Pandas",
            "#bdebd8",
            "data-analyst",
            "Student Performance Analysis",
          ],
          [
            "Intermediate",
            "Customer Churn Prediction",
            "Python · scikit-learn",
            "#ffdc9f",
            "data-scientist",
            "Customer Churn Prediction",
          ],
          [
            "Advanced",
            "Recommendation System",
            "Python · ML · APIs",
            "#cdbff1",
            "machine-learning-engineer",
            "Recommendation Engine",
          ],
        ].map(([level, title, tags, color, roleSlug, targetProject]) => {
          const role = roles.find((item) => item.slug === roleSlug);
          const projectId = role?.projects.find((project) => project.title === targetProject)?.id;
          return (
          <div
            className="project-card"
            style={{ "--project-color": color } as React.CSSProperties}
            key={title}
          >
            <div className="project-visual">
              <span>{level}</span>
              <div className="project-bars">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="project-card-body">
              <h3>{title}</h3>
              <p>{tags}</p>
              <button className="project-card-footer project-card-link" onClick={() => navigate("role", roleSlug, projectId)} aria-label={`Open the ${title} project plan`}>
                <span>{level} project</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

function Explore({
  navigate,
  query,
  setQuery,
}: {
  navigate: (v: View, slug?: string) => void;
  query: string;
  setQuery: (v: string) => void;
}) {
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [learningTime, setLearningTime] = useState("All");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const filtered = useMemo(
    () =>
      roles.filter(
        (role) =>
          (category === "All" || role.category === category) &&
          (difficulty === "All" || role.difficulty === difficulty) &&
          (learningTime === "All" || (learningTime === "short" ? !role.estimatedTime.includes("8–12") && !role.estimatedTime.includes("10–14") : learningTime === "mid" ? role.estimatedTime.includes("6–9") || role.estimatedTime.includes("8–12") : role.estimatedTime.includes("10–14") || role.estimatedTime.includes("12"))) &&
          roleSearchText(role).includes(query.toLowerCase()),
      ),
    [category, difficulty, learningTime, query],
  );
  return (
    <main className="explore-page section">
      <div className="page-intro">
        <div>
          <div className="eyebrow">THE ROLE LIBRARY</div>
          <h1>
            Choose your <em>direction.</em>
          </h1>
          <p>
            Browse 30 carefully mapped career paths. Start wherever your
            curiosity is pointing.
          </p>
        </div>
        <div className="explore-count">
          <b>{filtered.length}</b>
          <span>roles shown</span>
        </div>
      </div>
      <div className="explore-toolbar">
        <SearchBox query={query} setQuery={setQuery} navigate={navigate} />
        <div className="filter-scroll">
          <Filter size={15} />
          {categoryLabels.map((item) => (
            <button
              className={category === item ? "filter active" : "filter"}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item === "Software Development"
                ? "Software"
                : item === "Design & Product"
                  ? "Design"
                  : item}
            </button>
          ))}
          <select className="filter-select" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Filter by difficulty">
            <option value="All">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select className="filter-select" value={learningTime} onChange={(event) => setLearningTime(event.target.value)} aria-label="Filter by learning time">
            <option value="All">Any duration</option>
            <option value="short">Under 6 months</option>
            <option value="mid">6–12 months</option>
            <option value="long">12+ months</option>
          </select>
        </div>
      </div>
      {compareSlugs.length > 0 && <RoleComparison roles={roles.filter((role) => compareSlugs.includes(role.slug))} onRemove={(slug) => setCompareSlugs((current) => current.filter((item) => item !== slug))} />}
      {filtered.length ? (
        <div className="role-grid explore-grid">
          {filtered.map((role) => (
            <div className="explore-card-wrap" key={role.slug}>
              <RoleCard role={role} navigate={navigate} />
              <button className={compareSlugs.includes(role.slug) ? "compare-toggle active" : "compare-toggle"} onClick={() => setCompareSlugs((current) => current.includes(role.slug) ? current.filter((item) => item !== role.slug) : current.length < 3 ? [...current, role.slug] : current)}>{compareSlugs.includes(role.slug) ? "Comparing" : "Compare"}</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={30} />
          <h2>We couldn’t find that role.</h2>
          <p>Try another search, or browse all of our career paths.</p>
          <button
            className="primary-button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setDifficulty("All");
              setLearningTime("All");
            }}
          >
            Browse all roles
          </button>
        </div>
      )}
    </main>
  );
}

function RoleComparison({ roles: selectedRoles, onRemove }: { roles: Role[]; onRemove: (slug: string) => void }) {
  return <section className="comparison-panel"><div className="comparison-heading"><div><div className="eyebrow">ROLE COMPARISON</div><h2>See the tradeoffs clearly.</h2></div><span>{selectedRoles.length} / 3 selected</span></div><div className="comparison-grid"><div className="comparison-labels"><span>Role</span><span>Difficulty</span><span>Learning time</span><span>Stages</span><span>Core tools</span></div>{selectedRoles.map((role) => <div className="comparison-column" key={role.slug}><button onClick={() => onRemove(role.slug)} aria-label={`Remove ${role.title}`}><X size={14} /></button><b>{role.title}</b><span>{role.difficulty}</span><span>{role.estimatedTime}</span><span>{role.stages.length} stages</span><span>{role.technologies.slice(0, 3).join(" · ")}</span></div>)}</div></section>
}

type RoleGuide = { overview: string; analogy: string; workflow: string[]; industries: { name: string; example: string }[]; day: string[]; faq: { question: string; answer: string }[]; related: Role[] }
function roleGuide(role: Role): RoleGuide {
  const guides: Record<Category, { overview: string; analogy: string; workflow: string[]; industries: string[]; day: string[] }> = {
    "Software Development": { overview: "A software developer turns a problem into a working digital product. They write code, test it, fix issues, and work with other people to improve the result.", analogy: "Think of a developer as an architect and builder for digital tools: they understand the plan, choose the right materials, and make sure the building works.", workflow: ["Understand the problem", "Plan a small solution", "Write and test code", "Review and improve", "Ship the result"], industries: ["Technology", "Banking", "Healthcare", "Education"], day: ["Team stand-up", "Build a feature", "Review code", "Test and fix bugs", "Document the change"] },
    "Data & AI": { overview: "This career uses information to answer questions, discover patterns, or build intelligent features. The work usually combines careful thinking, technical tools, and clear communication.", analogy: "Imagine having a huge box of clues. This professional sorts the clues, finds the important patterns, and explains what they mean.", workflow: ["Understand the question", "Collect useful information", "Clean and explore it", "Find patterns or build a model", "Explain the result"], industries: ["E-commerce", "Banking", "Healthcare", "Transportation"], day: ["Check the question", "Work with data", "Test an idea", "Explain findings", "Document decisions"] },
    Cybersecurity: { overview: "A security professional helps people and organizations keep systems, accounts, and information safe. They look for weaknesses, investigate unusual activity, and improve defenses.", analogy: "Like a security team for a digital building, they understand who should enter, watch for unusual behavior, and improve the locks and alarms.", workflow: ["Understand what must be protected", "Watch for unusual activity", "Investigate evidence", "Reduce the risk", "Record and improve the defense"], industries: ["Technology", "Government", "Banking", "Healthcare"], day: ["Review alerts", "Investigate evidence", "Check a control", "Discuss a risk", "Write a security report"] },
    "Cloud & DevOps": { overview: "Cloud and operations professionals make sure software can run reliably for real users. They automate deployments, manage infrastructure, and prepare for failures.", analogy: "If software is a shop, this person runs the roads, electricity, storage, and emergency plans that keep the shop open.", workflow: ["Understand the service", "Design the environment", "Automate delivery", "Monitor behavior", "Recover and improve"], industries: ["Technology", "Media", "Retail", "Financial services"], day: ["Check service health", "Improve a deployment", "Review infrastructure", "Handle an alert", "Update a runbook"] },
    "Systems & Data": { overview: "Systems and data professionals keep the technical foundations dependable. They manage networks, servers, databases, and the information moving through them.", analogy: "They are the people who keep the invisible machinery behind digital services organized, available, and understandable.", workflow: ["Understand the environment", "Configure the system", "Monitor its behavior", "Troubleshoot a problem", "Automate and document"], industries: ["Technology", "Manufacturing", "Government", "Education"], day: ["Check systems", "Investigate a request", "Change configuration", "Test recovery", "Document the fix"] },
    "Design & Product": { overview: "Design and product professionals help teams decide what to build and how it should work for people. They learn about users, shape ideas, and communicate decisions.", analogy: "They are translators between people and technology: they turn a human need into a product that is clear and useful.", workflow: ["Understand people", "Frame the problem", "Explore possible solutions", "Test an idea", "Improve and deliver"], industries: ["Technology", "Healthcare", "Education", "Consumer products"], day: ["Review user evidence", "Sketch an idea", "Discuss tradeoffs", "Test a prototype", "Plan the next decision"] },
    Testing: { overview: "Testing professionals create confidence that software works as expected. They explore how a product behaves, report useful problems, and help teams prevent regressions.", analogy: "They are quality investigators: they ask what could go wrong before a real user has to discover it.", workflow: ["Understand the expected behavior", "Design useful checks", "Try the product", "Report evidence", "Verify the fix"], industries: ["Technology", "Banking", "Healthcare", "E-commerce"], day: ["Review a feature", "Run test scenarios", "Investigate a bug", "Discuss risk", "Verify a release"] },
  }
  const base = guides[role.category]
  const roleSpecific: Record<string, string> = { "Data Analyst": "A Data Analyst focuses on answering practical business questions with reports, queries, and dashboards.", "Data Scientist": "A Data Scientist studies patterns in data and builds models that help people make better predictions or decisions.", "Data Engineer": "A Data Engineer builds the pipelines and platforms that move trustworthy data to the people who need it.", "Machine Learning Engineer": "A Machine Learning Engineer turns models into reliable software that can work for real users.", "AI Engineer": "An AI Engineer builds useful AI features and connects models to products, data, and people.", "Product Manager": "A Product Manager helps a team choose the right problem, define the outcome, and decide what to build next." }
  const overview = roleSpecific[role.title] ?? `${role.title} professionals ${base.overview.charAt(0).toLowerCase()}${base.overview.slice(1)}`
  const related = roles.filter((candidate) => candidate.slug !== role.slug && candidate.category === role.category).slice(0, 4)
  return { overview, analogy: base.analogy, workflow: base.workflow, industries: base.industries.map((name) => ({ name, example: `Use ${role.title.toLowerCase()} skills to solve a real problem in ${name.toLowerCase()}.` })), day: base.day, related, faq: [{ question: "Can a beginner learn this career?", answer: "Yes, but the starting point depends on the role. Begin with the first roadmap stage and build small examples before moving forward." }, { question: "What should I learn first?", answer: `Start with ${role.learningOrder[0]}. It gives you the foundation for the next stage instead of asking you to learn everything at once.` }, { question: "Do I need a degree?", answer: "Requirements vary by country, employer, and role. A degree can be useful, but a clear portfolio and demonstrated skills can also help show what you can do." }, { question: "How long does it take?", answer: `RoleReady estimates ${role.estimatedTime} for the fundamentals and portfolio work. Your pace, background, and practice time will change that estimate.` }] }
}

function RoleEducation({ role, guide }: { role: Role; guide: RoleGuide }) {
  return <div className="role-education section"><section className="portal-intro"><div><div className="eyebrow">START WITH THE BIG PICTURE</div><h2>What is a {role.title}?</h2><p>{guide.overview}</p></div><div className="analogy-card"><span className="detail-label">A SIMPLE WAY TO THINK ABOUT IT</span><p>{guide.analogy}</p></div></section><section className="portal-flow"><div className="eyebrow">WHAT THIS PERSON ACTUALLY DOES</div><h2>From question to useful result.</h2><div className="flow-track">{guide.workflow.map((step, index) => <div className="flow-node" key={step}><span>0{index + 1}</span><b>{step}</b>{index < guide.workflow.length - 1 && <ArrowRight size={16} />}</div>)}</div></section><section className="portal-industries"><div className="section-heading compact"><div><div className="eyebrow">WHERE IT IS USED</div><h2>Real-world settings.</h2><p>The same career can look different across industries.</p></div></div><div className="industry-grid">{guide.industries.map((industry) => <div className="industry-card" key={industry.name}><b>{industry.name}</b><p>{industry.example}</p></div>)}</div></section><section className="why-skills"><div className="section-heading compact"><div><div className="eyebrow">WHY THESE SKILLS MATTER</div><h2>Learn the reason, not just the name.</h2><p>Every tool on the roadmap exists to help solve a real part of the job.</p></div></div><div className="why-skill-grid">{role.skills.slice(0, 3).map((group) => <div className="why-skill-card" key={group.group}><span className="skill-number">{group.group}</span><h3>{group.items[0]}</h3><p><b>WHAT:</b> A core part of the {group.group.toLowerCase()} toolkit.</p><p><b>WHY:</b> It helps a {role.title.toLowerCase()} make reliable decisions and explain their work.</p><p><b>WHERE:</b> You will practice it in the {role.learningOrder[0].toLowerCase()} and project stages.</p></div>)}</div></section></div>
}

function RolePage({
  role,
  navigate,
  focusProjectId,
}: {
  role: Role;
  navigate: (v: View, slug?: string) => void;
  focusProjectId: string | null;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  useEffect(() => {
    if (!focusProjectId || !role.projects.some((project) => project.id === focusProjectId)) return;
    setExpandedProject(focusProjectId);
    requestAnimationFrame(() => {
      document.getElementById(`project-${focusProjectId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [focusProjectId, role]);
  const stats = [
    { value: role.stages.length, label: "stages" },
    {
      value:
        role.skills.reduce((sum, group) => sum + group.items.length, 0) + 30,
      label: "skills mapped",
    },
      { value: role.stages.reduce((sum, stage) => sum + stage.resources.length, 0), label: "resources" },
      { value: role.projects.length, label: "project ideas" },
  ];
  return (
    <main className="role-page">
      <section
        className="role-hero section"
        style={{ "--role-accent": role.accent } as React.CSSProperties}
      >
        <button className="back-link" onClick={() => navigate("explore")}>
          ← Back to all roles
        </button>
        <div className="role-hero-grid">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> {role.category}
            </div>
            <h1>{role.title}</h1>
            <p>{role.description}</p>
            <div className="role-tags">
              <span>{role.difficulty}</span>
              <span>
                <Clock3 size={14} /> {role.estimatedTime}
              </span>
              <span>
                <BookOpen size={14} /> Structured path
              </span>
            </div>
          </div>
          <div className="role-hero-mark">
            <span>{role.title.slice(0, 2).toUpperCase()}</span>
            <div className="mark-line" />
          </div>
        </div>
        <div className="role-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section role-content">
        <div className="role-content-main">
          <div className="section-heading compact">
            <div>
              <div className="eyebrow">WHAT YOU’LL NEED</div>
              <h2>The toolkit, not the noise.</h2>
        <RoleEducation role={role} guide={roleGuide(role)} />
              <p>Build a balanced foundation across these three areas.</p>
            </div>
          </div>
          <div className="skill-grid">
            {role.skills.map((skill, index) => (
              <div className="skill-card" key={skill.group}>
                <span className="skill-number">0{index + 1}</span>
                <h3>{skill.group}</h3>
                {skill.items.map((item) => (
                  <span className="skill-item" key={item}>
                    <Check size={14} />
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
            <div className="role-toolkit-strip">
              <div>
                <span className="detail-label">PREREQUISITES</span>
                <p>{role.prerequisites.join(" · ")}</p>
              </div>
              <div>
                <span className="detail-label">REQUIRED TECHNOLOGIES</span>
                <div className="technology-pills">
                  {role.technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
              </div>
            </div>
          <div className="roadmap-heading">
            <div>
              <div className="eyebrow">THE ROADMAP</div>
              <h2>Learn in this order.</h2>
              <p>
                Each stage makes the next one easier. Expand a stage to see what
                to do next.
              </p>
            </div>
          </div>
          <div className="timeline">
            {role.stages.map((stage, index) => (
              <div
                className="timeline-item"
                key={stage.title}
              >
                <div className="timeline-marker">
                  <span>{`0${index + 1}`}</span>
                </div>
                <div className="stage-card">
                  <button
                    className="stage-head"
                    onClick={() =>
                      setExpanded(expanded === index ? null : index)
                    }
                  >
                    <div>
                      <span className="stage-kicker">{stage.kicker}</span>
                      <h3>{stage.title}</h3>
                      <p>{stage.description}</p>
                    </div>
                    <span className="stage-toggle">
                      <ChevronDown
                        size={17}
                        className={expanded === index ? "rotated" : ""}
                      />
                    </span>
                  </button>
                  {expanded === index && (
                    <div className="stage-details">
                      <div className="stage-meta">
                        <span>
                          <Clock3 size={14} /> {stage.time}
                        </span>
                        <span>
                          <Zap size={14} /> {stage.skills.join(" · ")}
                        </span>
                      </div>
                      <div className="stage-columns">
                        <div>
                          <span className="detail-label">WHAT TO LEARN</span>
                          {stage.skills.map((skill) => (
                            <span className="detail-item" key={skill}>
                              <Check size={13} /> {skill}
                            </span>
                          ))}
                          <span className="detail-label stage-sub-label">PREREQUISITE</span>
                          <span className="detail-note">{stage.prerequisites.join(" · ")}</span>
                        </div>
                        <div>
                          <span className="detail-label">TECHNOLOGIES</span>
                          <div className="technology-pills compact">
                            {stage.technologies.map((technology) => (
                              <span key={technology}>{technology}</span>
                            ))}
                          </div>
                          <span className="detail-label stage-sub-label">OUTCOMES</span>
                          {stage.outcomes.map((outcome) => (
                            <span className="detail-item" key={outcome}>
                              <Check size={13} /> {outcome}
                            </span>
                          ))}
                        </div>
                        <div className="stage-resources">
                          <span className="detail-label">RESOURCES</span>
                          {stage.resources.slice(0, 2).map((resource) => (
                            <ResourceMini
                              resource={resource}
                              key={resource.title}
                            />
                          ))}
                        </div>
                      </div>
                      {stage.projects[0] && (
                        <div className="stage-project">
                          <span className="detail-label">RECOMMENDED PROJECT</span>
                          <b>{stage.projects[0].title}</b>
                          <p>{stage.projects[0].problemStatement}</p>
                          <div className="project-tags">
                            {stage.projects[0].technologies.map((technology) => (
                              <span key={technology}>{technology}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="role-aside">
          <div className="aside-card">
            <div className="eyebrow">A NOTE FOR YOU</div>
            <h3>Consistency beats intensity.</h3>
            <p>
              You do not need to learn everything today. Pick one stage, make
              one small project, and come back tomorrow.
            </p>
            <div className="aside-rule" />
            <span>Keep going, one proof point at a time.</span>
          </div>
        </aside>
      </section>
      <section className="section projects-section">
        <div className="eyebrow">BUILD YOUR PROOF</div>
        <h2>
          Projects that make
          <br />
          <em>the learning stick.</em>
        </h2>
        <div className="project-grid">
          {role.projects.map((project) => (
            <div className={expandedProject === project.id ? "project-card project-expanded" : "project-card"} id={`project-${project.id}`} key={project.title}>
              <div className="project-head">
                <span>{project.level}</span>
                <ArrowUpRight size={17} />
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <small className="project-time">
                {project.estimatedTime} · {project.skills.join(" · ")}
              </small>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <button className="project-action" onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}>{expandedProject === project.id ? "Hide project plan" : "Build this project"} <ArrowRight size={14} /></button>
              {expandedProject === project.id && <div className="project-detail"><span className="detail-label">PROBLEM TO SOLVE</span><p>{project.problemStatement}</p><span className="detail-label stage-sub-label">FEATURES</span>{project.features.map((feature) => <span className="detail-item" key={feature}><Check size={13} /> {feature}</span>)}<span className="detail-label stage-sub-label">DELIVERABLES</span>{project.deliverables.map((deliverable) => <span className="detail-item" key={deliverable}><Check size={13} /> {deliverable}</span>)}</div>}
            </div>
          ))}
        </div>
      </section>
      <section className="career-progression section">
        <div>
          <div className="eyebrow">WHERE THIS ROADMAP CAN TAKE YOU</div>
          <h2>Keep the path open.</h2>
          <p>
            Career growth is not a single ladder. These are directions your
            skills can unlock over time.
          </p>
        </div>
        <div className="career-path">
          {role.careerProgression.map((step, index) => (
            <div className="career-step" key={step}>
              <span>0{index + 1}</span>
              <b>{step}</b>
              {index < role.careerProgression.length - 1 && <ArrowRight size={16} />}
            </div>
          ))}
        </div>
      </section>
      <section className="portal-bottom section">
        <div className="day-life">
          <div className="eyebrow">A DAY IN THE LIFE</div>
          <h2>What the work can look like.</h2>
          <div className="day-timeline">{roleGuide(role).day.map((item, index) => <div key={item}><span>{9 + index}:00</span><b>{item}</b></div>)}</div>
        </div>
        <div className="related-careers">
          <div className="eyebrow">IF THIS SOUNDS INTERESTING</div>
          <h2>Explore related careers.</h2>
          <div className="related-list">{roleGuide(role).related.map((related) => <button key={related.slug} onClick={() => navigate("role", related.slug)}><span>{related.title}</span><ArrowRight size={15} /></button>)}</div>
        </div>
      </section>
      <section className="faq-section section">
        <div className="eyebrow">BEGINNER QUESTIONS</div>
        <h2>Before you choose a direction.</h2>
        <div className="faq-list">{roleGuide(role).faq.map((item) => <details key={item.question}><summary>{item.question}<ChevronDown size={16} /></summary><p>{item.answer}</p></details>)}</div>
      </section>
    </main>
  );
}
function ResourceMini({ resource }: { resource: Resource }) {
  return (
    <a
      className="resource-mini"
      href={resource.url}
      target="_blank"
      rel="noreferrer"
    >
      <span>{resource.type}</span>
      <b>{resource.title}</b>
      <ExternalLink size={13} />
    </a>
  );
}
function About({ navigate }: { navigate: (v: View, slug?: string) => void }) {
  return (
    <main className="about-page section">
      <div className="about-hero">
        <div className="eyebrow">WHY ROLE READY EXISTS</div>
        <h1>
          A clearer way to
          <br />
          <em>move forward.</em>
        </h1>
        <p>
          Students are not short on ambition. They are short on a trustworthy
          sequence of next steps.
        </p>
      </div>
      <div className="about-grid">
        <div className="about-block">
          <span>01</span>
          <h2>The problem</h2>
          <p>
            Career advice is scattered across videos, bootcamps, job
            descriptions, and endless tabs. It is easy to confuse collecting
            resources with actually building a skill.
          </p>
        </div>
        <div className="about-block">
          <span>02</span>
          <h2>The solution</h2>
          <p>
            RoleReady organizes the journey around roles, not hype. You get the
            why, the order, the resources, and the projects in one calm place.
          </p>
        </div>
      </div>
      <div className="about-flow">
        <div className="eyebrow">HOW IT WORKS</div>
        {[
          "Choose a role",
          "Understand the skills",
          "Follow the roadmap",
          "Build your proof",
        ].map((item, index) => (
          <div className="flow-step" key={item}>
            <b>0{index + 1}</b>
            <span>{item}</span>
            {index < 3 && <ArrowRight size={18} />}
          </div>
        ))}
      </div>
      <div className="about-cta">
        <h2>
          Start with a direction.
          <br />
          <em>Grow from there.</em>
        </h2>
        <button className="primary-button" onClick={() => navigate("explore")}>
          Explore job roles <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}
function CareerMatcher({ close, navigate }: { close: () => void; navigate: (v: View, slug?: string) => void }) {
  const questions = [
    { title: "What do you enjoy most?", options: [["coding", "Building things"], ["data", "Working with data"], ["security", "Solving technical problems"], ["design", "Designing things"], ["cloud", "Protecting or managing systems"], ["product", "Managing ideas and products"]] },
    { title: "What kind of work sounds interesting?", options: [["coding", "Writing code"], ["data", "Finding patterns in data"], ["coding", "Creating websites or apps"], ["design", "Designing user experiences"], ["cloud", "Working with cloud infrastructure"], ["security", "Finding security problems"]] },
    { title: "How do you feel about mathematics?", options: [["high", "I enjoy mathematics"], ["medium", "I'm okay with mathematics"], ["low", "I prefer less mathematics"]] },
    { title: "What do you prefer?", options: [["coding", "Building"], ["data", "Analyzing"], ["design", "Designing"], ["security", "Securing"], ["product", "Managing"]] },
    { title: "What sounds most interesting?", options: [["coding", "Creating software"], ["data", "Understanding data"], ["ai", "Building AI systems"], ["security", "Protecting computers and networks"], ["cloud", "Managing cloud systems"], ["design", "Designing products"]] },
  ] as const;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const selectedAnswer = answers[step];
  const choose = (answer: string) => setAnswers((current) => [...current.slice(0, step), answer]);
  const next = () => { if (!selectedAnswer) return; setStep((current) => Math.min(current + 1, questions.length)); };
  const back = () => setStep((current) => Math.max(current - 1, 0));
  const restart = () => { setStep(0); setAnswers([]); setStarted(false); };
  const matches = roles.slice().map((role) => ({ role, score: nextScore(role, answers) })).sort((a, b) => b.score - a.score).slice(0, 3);
  const reasons = (role: Role) => { const reasonsForRole: string[] = []; if (answers.includes("data") && role.category === "Data & AI") reasonsForRole.push("You enjoy working with data"); if (answers.includes("coding") && role.category === "Software Development") reasonsForRole.push("You enjoy building things"); if (answers.includes("security") && role.category === "Cybersecurity") reasonsForRole.push("You are interested in protecting systems"); if (answers.includes("cloud") && role.category === "Cloud & DevOps") reasonsForRole.push("You are curious about infrastructure"); if (answers.includes("design") && role.category === "Design & Product") reasonsForRole.push("You enjoy designing experiences"); if (answers.includes("high") && role.category === "Data & AI") reasonsForRole.push("You enjoy mathematics"); return reasonsForRole.slice(0, 3).length ? reasonsForRole.slice(0, 3) : ["Your interests overlap with this career path", "You may enjoy the work style", "The roadmap is a useful direction to explore"]; };
  return <div className="matcher-backdrop" onClick={close}><div className="matcher-modal matcher-flow" onClick={(event) => event.stopPropagation()}><button className="matcher-close" onClick={close} aria-label="Close career matcher"><X size={18} /></button>{!started ? <div className="matcher-start"><div className="matcher-compass"><Compass size={24} /></div><div className="eyebrow">CAREER DISCOVERY</div><h2>Find your career path.</h2><p>Not sure which career is right for you? Answer five simple questions and we’ll show you a few paths worth exploring.</p><button className="primary-button" onClick={() => setStarted(true)}>Start <ArrowRight size={17} /></button></div> : step < questions.length ? <><div className="matcher-step-label">Question {step + 1} of {questions.length}</div><div className="matcher-progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div><h2>{questions[step].title}</h2><div className="matcher-options">{questions[step].options.map(([value, label]) => <button className={selectedAnswer === value ? "selected" : ""} key={`${value}-${label}`} onClick={() => choose(value)} aria-pressed={selectedAnswer === value}><span>{label}</span>{selectedAnswer === value ? <Check size={17} /> : <ArrowRight size={16} />}</button>)}</div><div className="matcher-nav">{step > 0 ? <button className="secondary-button" onClick={back}>← Back</button> : <span /> }<button className="primary-button" disabled={!selectedAnswer} onClick={next}>{step === questions.length - 1 ? "See My Career Matches" : "Next"} <ArrowRight size={16} /></button></div></> : <><div className="eyebrow">YOUR CAREER MATCHES</div><h2>Paths worth exploring.</h2><p className="matcher-intro">Based on your answers, these career paths may be worth exploring. Scores are questionnaire matches, not predictions.</p><div className="match-list">{matches.map(({ role, score }, index) => <div className="match-row result-row" key={role.slug}><span className="match-rank">0{index + 1}</span><div><b>{role.title}</b><small>Questionnaire match: {Math.min(98, Math.max(64, 62 + score * 2))}% · {role.category}</small><div className="match-reasons">{reasons(role).map((reason) => <span key={reason}><Check size={12} /> {reason}</span>)}</div></div><button onClick={() => navigate("role", role.slug)}>Explore Career <ArrowRight size={14} /></button></div>)}</div><div className="matcher-result-actions"><button className="secondary-button" onClick={restart}>Try Again</button><button className="primary-button" onClick={() => { close(); navigate("explore"); }}>Explore All Careers <ArrowRight size={15} /></button></div></>}</div></div>
}
function nextScore(role: Role, answers: string[]) { const categoryMap: Record<string, Category> = { coding: "Software Development", data: "Data & AI", ai: "Data & AI", security: "Cybersecurity", cloud: "Cloud & DevOps", design: "Design & Product", product: "Design & Product", build: "Software Development", insight: "Data & AI", protect: "Cybersecurity", operate: "Cloud & DevOps", shape: "Design & Product", app: "Software Development", analysis: "Data & AI", system: "Systems & Data", case: "Design & Product" }; return answers.reduce((total, answer) => total + (role.category === categoryMap[answer] ? 5 : 0) + (answer === "high" && role.category === "Data & AI" ? 3 : 0) + (answer === "ai" && ["AI Engineer", "Machine Learning Engineer", "MLOps Engineer"].includes(role.title) ? 4 : 0) + (answer === "deep" && role.difficulty === "Advanced" ? 2 : 0) + (answer === "creative" && role.category === "Design & Product" ? 3 : 0), 0) }
function CommandPalette({
  close,
  navigate,
  query,
  setQuery,
}: {
  close: () => void;
  navigate: (v: View, slug?: string) => void;
  query: string;
  setQuery: (v: string) => void;
}) {
  const matches = roles
    .filter((role) => roleSearchText(role).includes(query.toLowerCase()))
    .slice(0, 6);
  const popular = popularRoles.slice(0, 5);
  return (
    <div className="palette-backdrop" onClick={close}>
      <div
        className="command-palette"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="palette-input">
          <Search size={19} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search job roles..."
          />
          <kbd>ESC</kbd>
        </div>
        <div className="palette-content">
          {query ? (
            <div>
              <span className="palette-label">Results</span>
              {matches.length ? (
                matches.map((role) => (
                  <button
                    className="palette-result"
                    key={role.slug}
                    onClick={() => navigate("role", role.slug)}
                  >
                    <span className="palette-role-icon">
                      {role.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <b>{role.title}</b>
                      <small>{role.category}</small>
                    </span>
                    <ArrowRight size={15} />
                  </button>
                ))
              ) : (
                <p className="palette-empty">No roles match that search.</p>
              )}
            </div>
          ) : (
            <>
              <div>
                <span className="palette-label">Popular searches</span>
                {popular.map((role) => (
                  <button
                    className="palette-result"
                    key={role.slug}
                    onClick={() => navigate("role", role.slug)}
                  >
                    <span className="palette-role-icon">
                      {role.title.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <b>{role.title}</b>
                      <small>{role.category}</small>
                    </span>
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
              <div className="palette-shortcuts">
                <span>
                  <b>↑ ↓</b> Navigate
                </span>
                <span>
                  <b>Enter</b> Select
                </span>
                <span>
                  <b>Esc</b> Close
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function Footer({ navigate }: { navigate: (v: View, slug?: string) => void }) {
  return (
    <footer>
      <div>
        <button className="brand footer-brand" onClick={() => navigate("home")}>
          <span className="brand-mark">
            <Compass size={16} />
          </span>
          <span>
            Role<span className="brand-accent">Ready</span>
          </span>
        </button>
        <p>
          Choose your role. Follow the path.
          <br />
          Build your career.
        </p>
      </div>
      <div className="footer-links">
        <span>Explore</span>
        <button onClick={() => navigate("explore")}>Job roles</button>
        <button onClick={() => navigate("role", "data-scientist")}>
          Roadmaps
        </button>
        <button onClick={() => navigate("about")}>About</button>
      </div>
      <div className="footer-note">
        Built for the curious.
        <br />
        <span>© 2026 RoleReady</span>
      </div>
    </footer>
  );
}
export default App;
