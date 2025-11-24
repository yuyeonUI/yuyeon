import { ref, withKeys } from "vue";

import { useRender } from "@/composables/component";
import {
	createForm,
	type FormValidationResult,
	pressFormPropsOptions,
	type SubmitEventPromise,
} from "@/composables/form";
import { makeEventPromiseLike } from "@/util/common";
import { defineComponent } from "@/util/component";

const NAME = "y-form";

export const YForm = defineComponent({
	name: "YForm",
	props: {
		...pressFormPropsOptions(),
	},
	emits: {
		"update:modelValue": (val: boolean | null) => true,
		submit: (e: SubmitEventPromise) => true,
		"keydown.enter": (e: Event) => true,
	},
	setup(props, { emit, slots, expose }) {
		const form = createForm(props);
		const form$ = ref<HTMLFormElement>();
		// TODO: naming formData from form composition
		// const formData = ref();

		function onSubmit(_e: Event) {
			const validation = form.validate();
			const e: SubmitEventPromise = makeEventPromiseLike<
				SubmitEvent,
				FormValidationResult
			>(_e as SubmitEvent, validation);

			emit("submit", e);

			if (!e.defaultPrevented) {
				validation.then(({ valid }) => {
					if (valid) {
						form$.value?.submit();
					}
				});
			}
			e.preventDefault();
		}

		function onKeydown(e: Event) {
			e.preventDefault();
			e.stopImmediatePropagation();
			emit("keydown.enter", e);
		}

		expose({
			...form,
		});

		useRender(() => {
			return (
				<form
					ref={form$}
					class={[NAME]}
					novalidate
					onSubmit={onSubmit}
					onKeydown={withKeys(onKeydown, ["enter"])}
				>
					{slots.default?.()}
				</form>
			);
		});
	},
});

export type YForm = InstanceType<typeof YForm>;
