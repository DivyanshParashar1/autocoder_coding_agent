# Autocoder — AI-powered autonomous coding agent 🚀

**Autocoder** is an experimental agent that converts a natural-language project request into a runnable code project. It uses a three-stage pipeline (Planner → Architect → Coder) to create a structured plan, break it down into implementable tasks, and then implement files using tool-backed LLM agents. The generated project is written into the `generated_project/` folder.

---

## 🔍 Key Features
- **Planner**: Turns a user prompt into a structured project plan (name, description, tech stack, files).
- **Architect**: Breaks the plan into explicit implementation tasks with file paths and detailed instructions.
- **Coder**: A tool-using REACT-style agent that reads/writes files in `generated_project/` and iteratively completes tasks.
- Safe file writes: tools enforce writes only under `generated_project/` and prevent path escapes.

---

## 🧰 Tech stack & dependencies
- Python 3.11+
- Uses: `langgraph`, `langchain`, `langchain-groq`, `pydantic`, `python-dotenv`, and related packages
(See `[project]` section in `pyproject.toml` for the exact list.)

---

## ⚡ Quick start

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   python -m pip install -U pip
   python -m pip install -e .
   ```

2. Configure a `.env` with your GROQ API key (or other model credentials):
   ```
   GROQ_API_KEY="your_groq_api_key_here"
   ```

3. Run the agent:
   ```bash
   python main.py
   ```
   Enter a project prompt when prompted, e.g.:
   ```
   Build a colourful modern todo app in html css and js
   ```

4. Check the generated project:
   - Outputs are written to `generated_project/` (e.g., `index.html`, `styles.css`, etc.).
   - Use `agent/tools.py` helper tools (`list_files`, `read_file`, `write_file`) inside the agent to interact with the filesystem safely.

---

## 📁 Project structure (important files)
- `main.py` — CLI entry point (asks for project prompt and invokes the agent).
- `agent/graph.py` — main pipeline and agent composition (Planner, Architect, Coder).
- `agent/prompts.py` — prompts for the planner/architect/coder agents.
- `agent/states.py` — Pydantic models: `Plan`, `TaskPlan`, `ImplementationTask`, `CoderState`.
- `agent/tools.py` — file and command tools the Coder agent uses; writes to `generated_project/`.
- `generated_project/` — output folder for created projects.

---

## How it works (brief)
1. **Planner**: Uses LLM structured output to create `Plan`.
2. **Architect**: Converts `Plan` → `TaskPlan` (list of `ImplementationTask` with file paths and descriptions).
3. **Coder**: For each implementation step, the Coder agent is invoked with a toolset (read/write/list). It edits or creates files under `generated_project/` until all steps complete.

---

## Development & customization 🔧
- Modify prompts in `agent/prompts.py` to change planning / coding behavior.
- Add or extend tools in `agent/tools.py` for additional capabilities (tests, build, run).
- Swap or configure LLMs in `agent/graph.py` (currently `ChatGroq` is used).
- Increase `--recursion-limit` via `python main.py -r 200` if your task plan is large.

---

## Security & best practices ⚠️
> - Never commit API keys. Use `.env` and ensure it’s in `.gitignore`.
> - The project enforces safe writes to `generated_project/`, but review generated code before running it.

---

## Example
- Example prompt used in repository:
  > "Build a colourful modern todo app in html css and js"
- After running, you might find files like `generated_project/index.html` and `generated_project/styles.css` (a starting point for the generated app).

---

## Contributing & License
- Contributions welcome — open issues or PRs with improvements (prompts, tools, tests).
- Add a license file (e.g., `MIT`) if you want to mark usage terms.
