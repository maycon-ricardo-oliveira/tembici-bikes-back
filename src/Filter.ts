import FilterOption from "./FilterOption";

 export default abstract class Filter {
	readonly name: string;
	readonly queryName: string;
	readonly type: string;
	options: Array<FilterOption> = []

	constructor(name: string, queryName: string, type: string) {
		this.name = name;
		this.queryName = queryName;
		this.type = type;
	}
	abstract setFilter(option: string): any

}