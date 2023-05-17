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
      const techsNames = techs.map((tech) => tech.name.toLowerCase());
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
    <main className="h-screen bg-zinc-900 text-zinc-300 flex flex-col gap-10 items-center justify-center">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-md"
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
            <span className="text-red-500 text-sm">
              {errors.avatar?.message?.toString()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            className="border border-zinc-600 bg-zinc-800 text-white shadow-sm rounded h-10 px-3"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">
              {errors.name?.message?.toString()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            className="border border-zinc-600 bg-zinc-800 text-white shadow-sm rounded h-10 px-3"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">
              {errors.email?.message?.toString()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="border border-zinc-600 bg-zinc-800 text-white shadow-sm rounded h-10 px-3"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password?.message?.toString()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label className=" flex items-center justify-between">
            Techs:
            <button
              type="button"
              onClick={() => append({ name: "", knowledge: "basico" })}
              className="font-semibold text-emerald-500 h-6"
            >
              Adicionar
            </button>
          </label>
          {errors.techs && (
            <span className="text-red-500 text-sm">
              {errors.techs.message?.toString()}
            </span>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                className="border border-zinc-600 bg-zinc-800 text-white shadow-sm rounded h-10 px-1"
                {...register(`techs.${index}.name` as const)}
              />
              <select
                className="border border-zinc-600 bg-zinc-800 text-white shadow-sm rounded h-10 px-2"
                {...register(`techs.${index}.knowledge` as const)}
              >
                <option value="basico">Básico</option>
                <option value="intermediário">Intermediário</option>
                <option value="avançado">Avançado</option>
              </select>
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 rounded font-semibold text-white h-10 px-3 hover:bg-red-600"
              >
                Remover
              </button>
              {errors.techs?.[index]?.name && (
                <span className="text-red-500 text-sm">
                  {errors.techs?.[index]?.name?.message?.toString()}
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
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
