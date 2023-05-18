"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { list } from "postcss";

//create user schema
const createUserSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .transform((list) => list.item(0))
    .optional()
    .refine((file) => {
      if (file) return file.size < 2 * 1024 * 1024; //max 2mb
      return true;
    }, "O avatar precisa ter no máximo 2mb"),
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) =>
      name
        .trim()
        .split(/\s+/)
        .map((word) => word[0].toLocaleUpperCase() + word.slice(1)) //capitalize each word
        .join(" ")
    ),
  email: z
    .string()
    .email("e-mail inválido")
    .nonempty("O e-mail é obrigatório")
    .refine((email) => {
      return email.endsWith("@neon.com.br"); //custom validation
    }, "email precisa ser @neon.com.br"),
  password: z
    .string()
    .min(10, "A senha precisa de 10 caracteres")
    .nonempty("A senha é obrigatória"),
  techs: z
    .array(
      z.object({
        name: z.string().nonempty("O nome da tecnologia é obrigatório"),
        knowledge: z.enum(["basico", "intermediário", "avançado"]),
      })
    )
    .nonempty("Pelo menos uma tecnologia é obrigatória")
    .min(2, "Pelo menos duas tecnologias são obrigatórias")
    .refine((techs) => {
      const techsNames = techs.map((tech) => tech.name.toLowerCase().trim());
      const uniqueTechsNames = new Set(techsNames);
      return techsNames.length === uniqueTechsNames.size;
    }, "Tecnologias duplicadas"),
});

//form data type inference
type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function Home() {
  //output state
  const [output, setOutput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function createUser(data: CreateUserFormData) {
    console.log(data);
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-10 bg-zinc-900 text-zinc-300">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col w-full max-w-md gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar">Avatar</label>
          <input
            type="file"
            accept="image/*"
            id="avatar"
            {...register("avatar")}
          />
          {errors.avatar && (
            <span className="text-sm text-red-500">
              {errors.avatar?.message?.toString()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            className="h-10 px-3 text-white border rounded shadow-sm border-zinc-600 bg-zinc-800"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-sm text-red-500">
              {errors.name?.message?.toString()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            className="h-10 px-3 text-white border rounded shadow-sm border-zinc-600 bg-zinc-800"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-500">
              {errors.email?.message?.toString()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="h-10 px-3 text-white border rounded shadow-sm border-zinc-600 bg-zinc-800"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-sm text-red-500">
              {errors.password?.message?.toString()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between ">
            Techs:
            <button
              type="button"
              onClick={() => append({ name: "", knowledge: "basico" })}
              className="h-6 font-semibold text-emerald-500"
            >
              Adicionar
            </button>
          </label>
          {errors.techs && (
            <span className="text-sm text-red-500">
              {errors.techs.message?.toString()}
            </span>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                className="h-10 px-1 text-white border rounded shadow-sm border-zinc-600 bg-zinc-800"
                {...register(`techs.${index}.name` as const)}
              />
              <select
                className="h-10 px-2 text-white border rounded shadow-sm border-zinc-600 bg-zinc-800"
                {...register(`techs.${index}.knowledge` as const)}
              >
                <option value="basico">Básico</option>
                <option value="intermediário">Intermediário</option>
                <option value="avançado">Avançado</option>
              </select>
              <button
                type="button"
                onClick={() => remove(index)}
                className="h-10 px-3 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
              >
                Remover
              </button>
              {errors.techs?.[index]?.name && (
                <span className="text-sm text-red-500">
                  {errors.techs?.[index]?.name?.message?.toString()}
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="h-10 font-semibold text-white rounded bg-emerald-500 hover:bg-emerald-600"
        >
          Save
        </button>
      </form>
      <pre>
        <code>{output}</code>
      </pre>
    </main>
  );
}
