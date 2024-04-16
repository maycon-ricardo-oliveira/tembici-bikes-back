import Filter from "../Filter";
import FilterOption from "../FilterOption";

export default class PlanFilter extends Filter {
	options: Array<FilterOption> = []

	constructor () {
		super("Plano", "plan", "multi_select")
	}

	make(responseOptions: any) {
		responseOptions.map((option:any) => {
			const filterOption = new FilterOption(
				option.id,
				option.name,
				option.description
			);

			this.options.push(filterOption);
		})

	}

	setFilter(option: string): any {
		const isValidOption = this.options.find(item => item.name === option);
		return {
			property: this.name,
			"multi_select": {
				"contains": isValidOption ? option : ''
			}
		}
	}

}