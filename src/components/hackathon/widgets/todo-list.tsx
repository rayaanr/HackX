"use client";

import { useState, useEffect } from "react";
import type { UIHackathon } from "@/types/hackathon";

interface ToDoListProps {
  hackathon: UIHackathon;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  isDefault?: boolean;
}

export function ToDoList({ hackathon }: ToDoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    // Generate dynamic todos based on hackathon data
    const generateTodos = (): TodoItem[] => {
      const items: TodoItem[] = [];

      // Join Community - default completed item
      items.push({
        id: "join-community",
        text: "Join Community",
        completed: true,
        isDefault: true,
      });

      // Registration status
      const now = new Date();
      const registrationEnd = hackathon.registrationPeriod?.registrationEndDate;
      const hackathonStart = hackathon.hackathonPeriod?.hackathonStartDate;
      const hackathonEnd = hackathon.hackathonPeriod?.hackathonEndDate;
      const votingStart = hackathon.votingPeriod?.votingStartDate;

      if (registrationEnd && now < registrationEnd) {
        items.push({
          id: "complete-registration",
          text: "Complete registration",
          completed: false,
        });
      }

      if (
        hackathonStart &&
        hackathonEnd &&
        now >= hackathonStart &&
        now < hackathonEnd
      ) {
        items.push({
          id: "submit-project",
          text: "Submit project",
          completed: false,
        });
      } else if (hackathonEnd && now < hackathonEnd) {
        items.push({
          id: "submit-project",
          text: "Submit project",
          completed: false,
        });
      }

      if (votingStart && hackathon.votingPeriod?.votingEndDate) {
        const votingEnd = hackathon.votingPeriod.votingEndDate;
        if (now >= votingStart && now < votingEnd) {
          items.push({
            id: "vote-projects",
            text: "Vote projects",
            completed: false,
          });
        } else if (now < votingStart) {
          items.push({
            id: "vote-projects",
            text: "Vote projects",
            completed: false,
          });
        }
      }

      items.push({
        id: "check-result",
        text: "Check result",
        completed: false,
      });

      return items;
    };

    setTodos(generateTodos());
  }, [hackathon]);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  return (
    <div className="rounded-lg border border-white/20 bg-black/20 backdrop-blur-sm shadow-sm p-4">
      <h2 className="text-sm font-semibold mb-3 text-white">To Do List</h2>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-md border cursor-pointer transition-all duration-200 hover:bg-white/5 ${
              todo.completed
                ? "border-green-500/50 bg-green-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => !todo.isDefault && toggleTodo(todo.id)}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                todo.completed
                  ? "bg-green-500"
                  : "border-2 border-white/30 hover:border-white/50"
              }`}
            >
              {todo.completed && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-xs leading-tight ${
                todo.completed ? "font-medium text-green-400" : "text-white/70"
              }`}
            >
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
