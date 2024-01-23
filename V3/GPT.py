import os
import curses

def draw_menu(stdscr, files, selected, current_row):
    stdscr.clear()
    h, w = stdscr.getmaxyx()
    for i, file in enumerate(files):
        if i == current_row:
            stdscr.attron(curses.color_pair(1))
        
        checkbox = "[x]" if selected[i] else "[ ]"
        line = f"{checkbox} {file}"
        stdscr.addstr(i + 1, 2, line)

        if i == current_row:
            stdscr.attroff(curses.color_pair(1))
    stdscr.refresh()

def write_files_to_gpt(files, selected):
    with open("GPT.txt", "w") as output_file:
        for i, file in enumerate(files):
            if selected[i]:
                output_file.write(f"---\n\n{file}:\n```\n")
                with open(file, 'r') as f:
                    content = f.read()
                    output_file.write(content)
                output_file.write("\n```\n\n")

def main(stdscr):
    curses.curs_set(0) # Hide the cursor
    curses.init_pair(1, curses.COLOR_BLACK, curses.COLOR_WHITE) # Selected item highlight

    files = [f for f in os.listdir('.') if os.path.isfile(f)]
    files.sort()
    selected = [False] * len(files)
    current_row = 0

    draw_menu(stdscr, files, selected, current_row)
    while True:
        key = stdscr.getch()

        if key == curses.KEY_UP and current_row > 0:
            current_row -= 1
        elif key == curses.KEY_DOWN and current_row < len(files) - 1:
            current_row += 1
        elif key == ord(" "):  # Use the spacebar to select/unselect
            selected[current_row] = not selected[current_row]
        elif key == ord("\n"):  # Press Enter to finish selection
            write_files_to_gpt(files, selected)
            break
        
        draw_menu(stdscr, files, selected, current_row)

if __name__ == "__main__":
    curses.wrapper(main)