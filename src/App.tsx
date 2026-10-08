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
import { popularRoles, roles, type Resource, type Role } from "./data";
import "./App.css";
import "./roadmap.css";

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

function App() {
  const [view, setView] = useState<View>("home");
  const [selectedSlug, setSelectedSlug] = useState("data-scientist");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(true);
  const [menu, setMenu] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = (next: View, slug?: string) => {
    setView(next);
    if (slug) setSelectedSlug(slug);
    setMenu(false);
    setPaletteOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
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
        />
      )}{" "}
      {view === "explore" && (
        <Explore navigate={navigate} query={query} setQuery={setQuery} />
      )}{" "}
      {view === "role" && <RolePage role={selected} navigate={navigate} />}{" "}
      {view === "about" && <About navigate={navigate} />}
      <Footer navigate={navigate} />
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
        .filter(
          (role) =>
            role.title.toLowerCase().includes(query.toLowerCase()) ||
            role.category.toLowerCase().includes(query.toLowerCase()),
        )
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
}: {
  navigate: (v: View, slug?: string) => void;
  query: string;
  setQuery: (v: string) => void;
  openPalette: () => void;
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
            Find the roadmap
            <br />
            to your <em>dream job.</em>
          </h1>
          <p className="hero-lede">
            Choose a job role and discover exactly what to learn, where to learn
            it, and what to build next.
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
          <button
            className="primary-button hero-cta"
            onClick={() => navigate("explore")}
          >
            Explore roadmaps <ArrowRight size={17} />
          </button>
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
              onClick={() => navigate("explore")}
              className={category === "All" ? "active" : ""}
            >
              {category === "Software Development"
                ? "Software"
                : category === "Design & Product"
                  ? "Design"
                  : category}
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
      <ProjectShowcase />
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
        <div className="preview-progress">
          <span style={{ width: "38%" }} />
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
            <span className="completion-pill">
              <span /> 0% started
            </span>
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
  const resources: [string, string, string, string, typeof BookOpen][] = [
    [
      "Video",
      "Python for Beginners",
      "freeCodeCamp",
      "Start with the language that powers your analysis.",
      Code2,
    ],
    [
      "Course",
      "Data Analysis with Python",
      "freeCodeCamp",
      "Move from syntax into useful, practical analysis.",
      BookOpen,
    ],
    [
      "Documentation",
      "Python documentation",
      "Python.org",
      "Keep the source of truth close as you learn.",
      BookOpen,
    ],
    [
      "Practice",
      "Python track",
      "Exercism",
      "Build fluency through small, focused exercises.",
      Zap,
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
        {resources.map(([type, title, provider, copy, Icon]) => (
          <a
            className={`resource-card resource-${type.toLowerCase()}`}
            href="https://www.freecodecamp.org/learn/"
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
function ProjectShowcase() {
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
          ],
          [
            "Intermediate",
            "Customer Churn Prediction",
            "Python · scikit-learn",
            "#ffdc9f",
          ],
          [
            "Advanced",
            "Recommendation System",
            "Python · ML · APIs",
            "#cdbff1",
          ],
        ].map(([level, title, tags, color]) => (
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
              <div className="project-card-footer">
                <span>{level} project</span>
                <ArrowUpRight size={16} />
              </div>
            </div>
          </div>
        ))}
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
  const filtered = useMemo(
    () =>
      roles.filter(
        (role) =>
          (category === "All" || role.category === category) &&
          role.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
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
        </div>
      </div>
      {filtered.length ? (
        <div className="role-grid explore-grid">
          {filtered.map((role) => (
            <RoleCard key={role.slug} role={role} navigate={navigate} />
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
            }}
          >
            Browse all roles
          </button>
        </div>
      )}
    </main>
  );
}

function RolePage({
  role,
  navigate,
}: {
  role: Role;
  navigate: (v: View, slug?: string) => void;
}) {
  const key = `progress-${role.slug}`;
  const [completed, setCompleted] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem(key) || "[]"),
  );
  const [expanded, setExpanded] = useState<number | null>(0);
  const toggle = (index: number) =>
    setCompleted((current) => {
      const next = current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
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
                <Clock3 size={14} /> 16–20 weeks
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
            <div className="progress-box">
              <div>
                <span>Your progress</span>
                <b>
                  {Math.round((completed.length / role.stages.length) * 100)}%
                </b>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${(completed.length / role.stages.length) * 100}%`,
                  }}
                />
              </div>
              <small>
                {completed.length} of {role.stages.length} stages complete
              </small>
            </div>
          </div>
          <div className="timeline">
            {role.stages.map((stage, index) => (
              <div
                className={
                  completed.includes(index)
                    ? "timeline-item complete"
                    : "timeline-item"
                }
                key={stage.title}
              >
                <div className="timeline-marker">
                  <span>
                    {completed.includes(index) ? (
                      <Check size={16} />
                    ) : (
                      `0${index + 1}`
                    )}
                  </span>
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
                  <div className="stage-actions">
                    <button
                      className="complete-button"
                      onClick={() => toggle(index)}
                    >
                      {completed.includes(index)
                        ? "Completed"
                        : "Mark stage complete"}
                      {completed.includes(index) && <Check size={14} />}
                    </button>
                  </div>
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
            <div className="project-card" key={project.title}>
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
    .filter(
      (role) =>
        role.title.toLowerCase().includes(query.toLowerCase()) ||
        role.category.toLowerCase().includes(query.toLowerCase()),
    )
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
